import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { env } from '../config/env';

interface Video {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
}

interface VideoPlayerProps {
    video: Video;
    onWatchComplete?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onWatchComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [watchId, setWatchId] = useState<string | null>(null);
    const [hasWatchedToday, setHasWatchedToday] = useState(false);
    const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const watchStartRef = useRef(false);

    useEffect(() => {
        // Start watch tracking when component mounts
        if (!watchStartRef.current) {
            watchStartRef.current = true;
            startWatchTracking();
        }

        setIsVideoReady(false);

        if (!video.thumbnailUrl && videoRef.current) {
            const videoElement = videoRef.current;
            if (videoElement.readyState >= 1) {
                generateAndUploadThumbnail();
            } else {
                videoElement.addEventListener('loadedmetadata', generateAndUploadThumbnail, { once: true });
            }
        }

        return () => {
            watchStartRef.current = false;
        };
    }, [video._id, video.thumbnailUrl]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
            const playPromise = videoRef.current.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    // Autoplay may be blocked by the browser; that's okay.
                });
            }
        }
    }, [isMuted]);

    const generateAndUploadThumbnail = async () => {
        try {
            const thumbnailDataUrl = await generateThumbnail();
            if (thumbnailDataUrl) {
                // Display generated thumbnail immediately (don't wait for upload)
                setGeneratedThumbnail(thumbnailDataUrl);

                // Upload to server in background (fire and forget)
                uploadThumbnail(thumbnailDataUrl).catch(error => {
                    console.error('Background thumbnail upload failed:', error);
                });
            }
        } catch (error) {
            console.error('Error generating thumbnail:', error);
        }
    };

    const startWatchTracking = async () => {
        try {
            const response = await axios.post(`${env.API_BASE_URL}/videos/${video._id}/watch`);
            if (response.data.watch) {
                setWatchId(response.data.watch._id);
                if (response.data.message === "Already watched today") {
                    setHasWatchedToday(true);
                }
            }
        } catch (error) {
            console.error('Error starting watch tracking:', error);
        }
    };

    const handleTimeUpdate = async () => {
        if (!videoRef.current || !watchId || hasWatchedToday) return;

        const currentTime = videoRef.current.currentTime;
        setCurrentTime(currentTime);

        try {
            await axios.put(`${env.API_BASE_URL}/videos/${video._id}/watch/${watchId}`, {
                watchDuration: Math.floor(currentTime),
                completed: currentTime >= video.duration * 0.9, // 90% watched
            });
        } catch (error) {
            console.error('Error updating watch progress:', error);
        }
    };

    const handleEnded = async () => {
        if (!watchId || hasWatchedToday) return;

        try {
            await axios.put(`${env.API_BASE_URL}/videos/${video._id}/watch/${watchId}`, {
                watchDuration: video.duration,
                completed: true,
            });

            setHasWatchedToday(true);
            if (onWatchComplete) {
                onWatchComplete();
            }
        } catch (error) {
            console.error('Error completing watch:', error);
        }
    };

    const generateThumbnail = async () => {
        const thumbnailVideo = document.createElement('video');
        thumbnailVideo.crossOrigin = 'anonymous';
        thumbnailVideo.src = video.videoUrl;
        thumbnailVideo.preload = 'metadata';
        thumbnailVideo.muted = true;

        await new Promise((resolve) => {
            if (thumbnailVideo.readyState >= 1) {
                return resolve(void 0);
            }
            const onLoadedMetadata = () => {
                thumbnailVideo.removeEventListener('loadedmetadata', onLoadedMetadata);
                resolve(void 0);
            };
            thumbnailVideo.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const thumbnailWidth = 320;
        const thumbnailHeight = Math.round((thumbnailVideo.videoHeight / thumbnailVideo.videoWidth) * thumbnailWidth);
        canvas.width = thumbnailWidth;
        canvas.height = thumbnailHeight;

        const thumbnailTime = thumbnailVideo.duration > 1 ? 0.5 : 0;
        thumbnailVideo.currentTime = thumbnailTime;

        await new Promise((resolve) => {
            const onSeeked = () => {
                ctx.drawImage(thumbnailVideo, 0, 0, canvas.width, canvas.height);
                thumbnailVideo.removeEventListener('seeked', onSeeked);
                resolve(void 0);
            };
            thumbnailVideo.addEventListener('seeked', onSeeked, { once: true });
        });

        return canvas.toDataURL('image/jpeg', 0.6);
    };

    const uploadThumbnail = async (thumbnailDataUrl: string) => {
        try {
            // Convert data URL to blob
            const response = await fetch(thumbnailDataUrl);
            const blob = await response.blob();

            const formData = new FormData();
            formData.append('thumbnail', blob, `thumbnail-${video._id}.jpg`);

            const uploadResponse = await axios.post(`${env.API_BASE_URL}/videos/${video._id}/thumbnail`, formData);

            console.log('Thumbnail uploaded successfully:', uploadResponse.data);
            return uploadResponse.data.thumbnailUrl;
        } catch (error) {
            console.error('Error uploading thumbnail:', error);
            return null;
        }
    };

    const formatTime = (seconds: number): string => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleMute = () => {
        if (!videoRef.current) return;

        const nextMuted = !isMuted;
        videoRef.current.muted = nextMuted;
        setIsMuted(nextMuted);
    };

    const progressPercent = video.duration ? Math.min((currentTime / video.duration) * 100, 100) : 0;
    const posterUrl = generatedThumbnail || video.thumbnailUrl;
    const showFallbackPoster = !posterUrl && !isVideoReady;

    return (
        <div className="relative w-full h-full overflow-hidden bg-black rounded-lg">
            {showFallbackPoster && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                    <div className="px-4 py-3 text-center border border-white/15 rounded-xl bg-black/45 backdrop-blur-sm">
                        <p className="text-sm font-semibold text-white">{video.title}</p>
                        <p className="mt-1 text-xs text-white/70">Thumbnail unavailable</p>
                    </div>
                </div>
            )}

            <video
                ref={videoRef}
                src={video.videoUrl}
                poster={posterUrl || undefined}
                preload="metadata"
                className="object-contain w-full h-full"
                controls={!hasWatchedToday}
                autoPlay
                muted={isMuted}
                playsInline
                crossOrigin="anonymous"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedData={() => setIsVideoReady(true)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                <div className="h-2 mb-3 overflow-hidden bg-gray-700 rounded-full">
                    <div
                        className="h-full transition-all duration-200 bg-green-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <h3 className="text-lg font-semibold text-white">{video.title}</h3>
                <p className="text-sm text-white/80">{video.description}</p>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col space-y-1 text-sm text-white/80">
                        <span>{formatTime(currentTime)} / {formatTime(video.duration)}</span>
                        <span>Watch the full video to help qualify for today&apos;s package daily return.</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleMute}
                            className="px-3 py-2 text-sm font-semibold text-white rounded-full bg-black/70 hover:bg-black/90"
                        >
                            {isMuted ? '🔈 Mute' : '🔊 Unmute'}
                        </button>

                        {hasWatchedToday && (
                            <div className="px-3 py-1 text-sm text-white bg-green-600 rounded-full">
                                ✓ Watched Today
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;