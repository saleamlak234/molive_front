import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { env } from '../config/env';
import { useAuth } from '../contexts/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import LoadingSpinner from '../components/LoadingSpinner';
import { Play, DollarSign, CheckCircle, ThumbsUp, Eye } from 'lucide-react';

interface Video {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    totalViews: number;
}

interface WatchHistory {
    _id: string;
    video: Video;
    watchedAt: string;
    rewardGiven: boolean;
    fullWatch: boolean;
}

interface VideoRewardsSummary {
    todayRewards: number;
    ownDailyReturn?: number;
    downlineDailyReturnCommission?: number;
    availableVideos: number;
    videosWatchedToday: number;
    qualifiesForDailyReturn: boolean;
    warningMessage?: string;
}

const translations = {
    en: {
        watchEarn: 'Watch & Earn',
        watchDescription:
            "Watch all active videos fully to qualify for today's earnings. Your balance updates once all active videos are completed.",
        todaysEarnings: "Today's Earnings",
        videosWatched: 'Videos Watched Today',
        availableVideos: 'Available Videos',
        requiredToday: 'Required Today',
        close: 'Close',
        noVideos: 'No videos available right now.',
        selectedVideo: 'Selected Video',
        views: 'Views',
        duration: 'Duration',
        like: 'Like',
        liked: 'Liked',
        watch: 'Watch',
        watched: 'Watched',
        watchProgressHint:
            'Use the player controls to watch. Progress and rewards update automatically.',
        language: 'Language',
    },
    am: {
        watchEarn: 'ተመለከቱ እና ይቀበሉ',
        watchDescription:
            'ሁሉንም ንብረት ቪዲዮዎች በሙሉ በመመልከት የዛሬን ገቢ ይቀበሉ። ብድርዎ ማለዳ በድርሰት ይታወሳል።',
        todaysEarnings: 'የዛሬ ገቢ',
        videosWatched: 'ዛሬ የተመለከዱ ቪዲዮዎች',
        availableVideos: 'የሚገኙ ቪዲዮዎች',
        requiredToday: 'ዛሬ የሚያስፈልገው',
        close: 'ዝጋ',
        noVideos: 'እስካሁን ቪዲዮ የለም።',
        selectedVideo: 'ተመረጠ ቪዲዮ',
        views: 'እይታዎች',
        duration: 'የጊዜ ርዝመት',
        like: 'ውድድር',
        liked: 'ተወው',
        watch: 'ተመለከቱ',
        watched: 'ተመለከዷል',
        watchProgressHint:
            'ቪዲዮ በመቆጣጠር ይመልከቱ። እድገቱና ብርን በራስዎ ይቀይራሉ።',
        language: 'ቋንቋ',
    },
    om: {
        watchEarn: 'Daawwiitii fi Qabdi',
        watchDescription:
            'Viidiyoowwan hunda guutummaatti daawwadhu fi gatii guyyaa keeti argadhu. Baalansiin keetii halkanii galgala ni dabalama.',
        todaysEarnings: 'Argannoo Har’aa',
        videosWatched: 'Viidiyoo Har’aa Daawwataman',
        availableVideos: 'Viidiyoowwan Argaman',
        requiredToday: 'Har’a Barbaachisu',
        close: 'Cufi',
        noVideos: 'Amma viidiyoowwan tokko illee hin jiru.',
        selectedVideo: 'Viidiyoo Filatame',
        views: 'Daawwannaa',
        duration: 'Yeroo',
        like: 'Jaalladhu',
        liked: 'Jaallatame',
        watch: 'Daawwadhu',
        watched: 'Daawwatame',
        watchProgressHint:
            'To’annoo taphataa fayyadami, fooyya’insa fi badhaasni ofumaan ni haarawa.',
        language: 'Afaan',
    },
    ti: {
        watchEarn: 'ተመለከትን እና ብር ተቀብለ',
        watchDescription:
            'ንብረትን በሙሉ በመመልከት የዛሬን ገቢ ይቀበሉ። ብድርዎ በሌሊት ይጨምራል።',
        todaysEarnings: 'የዛሬ ገቢ',
        videosWatched: 'ዛሬ የታዩ ቪዲዮዎች',
        availableVideos: 'የሚገኙ ቪዲዮዎች',
        requiredToday: 'ዛሬ የሚያስፈልገው',
        close: 'ዝጋ',
        noVideos: 'አሁን የሚገኙ ቪዲዮዎች የሉም።',
        selectedVideo: 'የተመረጠ ቪዲዮ',
        views: 'ማየት',
        duration: 'ጊዜ',
        like: 'ወደድ',
        liked: 'ወደደ',
        watch: 'ኣብይ',
        watched: 'ተዣዊለ',
        watchProgressHint:
            'ቪዲዮ ንዝተጠቀም ኣብዚ ጊዜ ማየት ይችላሉ። እድገታን ብርን በቀላሉ ይግበሩ።',
        language: 'ቋንቋ',
    },
};

const Videos: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [videos, setVideos] = useState<Video[]>([]);
    const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
    const [videoRewards, setVideoRewards] = useState<VideoRewardsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
    const [locale, setLocale] = useState<'en' | 'am' | 'om' | 'ti'>('en');

    const t = translations[locale];
    const numberFormatter = new Intl.NumberFormat(
        locale === 'am' ? 'am-ET' : 'en-US',
    );

    const BaseUrl = env.API_BASE_URL || 'http://www.molivetradingplc.com';
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchVideos(), fetchWatchHistory(), fetchTodayRewards()]);
            setLoading(false);
        };
        loadData();
    }, [locale]);

    const fetchVideos = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/videos/active`);
            setVideos(response.data.videos);
        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    };

    const fetchWatchHistory = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/videos/history`);
            setWatchHistory(response.data.watches);
        } catch (error) {
            console.error('Error fetching watch history:', error);
        }
    };

    const fetchTodayRewards = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/videos/rewards/today`);
            setVideoRewards(response.data);
            return response.data as VideoRewardsSummary;
        } catch (error) {
            console.error('Error fetching video rewards:', error);
            return null;
        }
    };

    const refreshUser = async () => {
        if (!user) return;
        try {
            const response = await axios.get(`${BaseUrl}/auth/me`);
            updateUser(response.data.user);
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    };

    const handleLike = (videoId: string) => {
        setLikedVideos(prev => {
            const newLiked = new Set(prev);
            if (newLiked.has(videoId)) {
                newLiked.delete(videoId);
            } else {
                newLiked.add(videoId);
            }
            return newLiked;
        });
    };

    const handleWatchComplete = async () => {
        await fetchWatchHistory();
        const rewards = await fetchTodayRewards();
        if (rewards?.qualifiesForDailyReturn) {
            await claimTodayRewards();
        }
        await refreshUser();
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const balanceDisplay = videoRewards?.warningMessage
        ? videoRewards.warningMessage
        : videoRewards?.qualifiesForDailyReturn
            ? `${numberFormatter.format(user?.balance ?? 0)} Birr`
            : 'Not qualified yet';

    const balanceHelperText = videoRewards?.warningMessage
        ? 'Resolve the issue above to qualify for rewards.'
        : videoRewards?.qualifiesForDailyReturn
            ? 'Your latest account balance as of this session.'
            : 'Complete all active videos fully to unlock the balance display.';

    const hasWatchedToday = (videoId: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return watchHistory.some(watch =>
            watch?.video?._id === videoId &&
            watch.watchedAt &&
            new Date(watch.watchedAt) >= today &&
            watch.fullWatch
        );
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Header with Today's Earnings */}
                <div className="mb-8 rounded-[32px] bg-white/80 p-6 shadow-xl backdrop-blur-sm">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-sm font-semibold tracking-[0.24em] uppercase text-emerald-600">
                                {t.watchEarn}
                            </p>
                            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                                {t.watchEarn}
                            </h1>
                            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                                {t.watchDescription}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 px-5 py-4 text-white shadow-2xl rounded-3xl bg-slate-900">
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-8 h-8 text-green-500" />
                                <div>
                                    <p className="text-sm uppercase tracking-[0.18em] text-green-300">
                                        Current Balance
                                    </p>
                                    <p className="text-3xl font-semibold">
                                        {numberFormatter.format(user?.balance ?? 0)} Birr
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-200">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm font-medium text-slate-500">{t.language}:</span>
                            <button
                                onClick={() => setLocale('en')}
                                className={`rounded-full px-4 py-2 text-sm font-semibold ${locale === 'en' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
                            >
                                English
                            </button>
                            <button
                                onClick={() => setLocale('am')}
                                className={`rounded-full px-4 py-2 text-sm font-semibold ${locale === 'am' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
                            >
                                አማርኛ
                            </button>
                            <button
                                onClick={() => setLocale('om')}
                                className={`rounded-full px-4 py-2 text-sm font-semibold ${locale === 'om' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
                            >
                                Afaan Oromoo
                            </button>
                            <button
                                onClick={() => setLocale('ti')}
                                className={`rounded-full px-4 py-2 text-sm font-semibold ${locale === 'ti' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
                            >
                                ትግርኛ
                            </button>
                        </div>
                    </div>
                </div>



                {/* Today's Earnings Summary */}
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
                    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                        <div className="flex items-center gap-4">
                            <DollarSign className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Current Balance</p>
                                <p className={`text-2xl font-bold ${videoRewards?.qualifiesForDailyReturn ? 'text-gray-900' : 'text-orange-600'}`}>
                                    {balanceDisplay}
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    {balanceHelperText}
                                </p>
                                                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                        <div className="flex items-center gap-4">
                            <Play className="w-8 h-8 text-emerald-600" />
                            <div>
                                <p className="text-sm text-gray-600">{t.videosWatched}</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {watchHistory.filter((watch) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return new Date(watch.watchedAt) >= today && watch.fullWatch;
                                    }).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Today's Reward Status</p>
                                <p className="mt-2 text-2xl font-bold text-gray-900">
                                    {videoRewards?.qualifiesForDailyReturn
                                        ? `${numberFormatter.format(videoRewards.todayRewards)} Birr` : 'Not eligible yet'}
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    {videoRewards
                                        ? videoRewards.qualifiesForDailyReturn
                                            ? 'Your daily reward will be automatically added once you finish all videos.'
                                            : `Watch ${Math.max(0, videoRewards.availableVideos - videoRewards.videosWatchedToday)} more video(s) today.`
                                        : 'Loading reward progress...'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                        <div className="flex items-center gap-4">
                            <CheckCircle className="w-8 h-8 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600">{t.availableVideos}</p>
                                <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Player Modal */}
                {selectedVideo && (
                    <div className="fixed inset-0 z-50 px-4 py-6 overflow-y-auto bg-black/80 sm:px-6">
                        <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-900/5 lg:grid lg:grid-cols-[2fr_1fr] lg:gap-0">
                            <div className="bg-slate-950 lg:rounded-l-[32px] lg:overflow-hidden">
                                <VideoPlayer
                                    video={selectedVideo}
                                    onWatchComplete={handleWatchComplete}
                                />
                            </div>
                            <div className="flex flex-col justify-between p-6 sm:p-8">
                                <div>
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                                {t.selectedVideo}
                                            </p>
                                            <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                                                {selectedVideo.title}
                                            </h2>
                                        </div>
                                        <button
                                            onClick={() => setSelectedVideo(null)}
                                            className="px-4 py-2 text-sm font-semibold transition bg-white border rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
                                        >
                                            {t.close}
                                        </button>
                                    </div>

                                    <p className="mb-6 text-sm leading-6 text-slate-600">
                                        {selectedVideo.description}
                                    </p>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="p-4 rounded-3xl bg-slate-50">
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t.duration}</p>
                                            <p className="mt-2 text-lg font-semibold text-slate-900">
                                                {formatDuration(selectedVideo.duration)}
                                            </p>
                                        </div>

                                    </div>
                                </div>

                                <div className="p-5 mt-6 text-white rounded-3xl bg-slate-900">
                                    <p className="text-sm uppercase tracking-[0.18em] text-emerald-200">{t.views}</p>
                                    <p className="mt-3 text-3xl font-semibold">
                                        {numberFormatter.format(selectedVideo.totalViews)}
                                    </p>
                                    <p className="mt-2 text-sm text-slate-300">
                                        {t.watchProgressHint}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Videos Grid - YouTube Style */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {videos.map((video) => {
                        const watched = hasWatchedToday(video._id);
                        const isLiked = likedVideos.has(video._id);
                        return (
                            <div
                                key={video._id}
                                className="overflow-hidden transition-all duration-300 bg-white shadow-sm rounded-xl hover:shadow-lg group"
                            >
                                {/* Video Thumbnail - YouTube Style */}
                                <div className="relative overflow-hidden bg-gray-900 aspect-video">
                                    {video.thumbnailUrl ? (
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="object-cover object-top w-full h-full transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                            <Play className="w-16 h-16 text-gray-400" />
                                        </div>
                                    )}

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={() => setSelectedVideo(video)}
                                            className="flex items-center justify-center w-20 h-20 text-white transition-colors bg-red-600 rounded-full shadow-lg hover:bg-red-700"
                                            disabled={watched}
                                        >
                                            <Play className="w-8 h-8 ml-1" fill="white" />
                                        </button>
                                    </div>

                                    {/* Reward Badge */}

                                    {/* Duration Badge */}
                                    <div className="absolute px-2 py-1 text-xs text-white bg-black rounded bottom-2 right-2 bg-opacity-80">
                                        {formatDuration(video.duration)}
                                    </div>

                                    {/* Watched Badge */}
                                    {watched && (
                                        <div className="absolute flex items-center px-2 py-1 text-xs text-white bg-green-600 rounded-full top-2 right-2">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Watched
                                        </div>
                                    )}
                                </div>

                                {/* Video Info - YouTube Style */}
                                <div className="p-3">
                                    <h3 className="mb-1 text-sm font-semibold leading-tight text-gray-900 cursor-pointer line-clamp-2 hover:text-emerald-600">
                                        {video.title}
                                    </h3>

                                    <p className="mb-1 text-[11px] text-gray-600 line-clamp-2">
                                        {video.description}
                                    </p>

                                    {/* Stats Row */}
                                    <div className="flex items-center justify-between mb-1 text-[10px] text-gray-500">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center">

                                                <Eye className="w-4 h-4 mr-1" />
                                                {numberFormatter.format(video.totalViews)} {t.views}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between mt-1">
                                        <button
                                            onClick={() => handleLike(video._id)}
                                            className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${isLiked
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                                            <span className="text-xs font-medium">
                                                {isLiked ? t.liked : t.like}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => setSelectedVideo(video)}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${watched
                                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                }`}
                                            disabled={watched}
                                        >
                                            {watched ? t.watched : t.watch}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {videos.length === 0 && (
                    <div className="py-12 text-center">
                        <Play className="w-16 h-16 mx-auto text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            {t.noVideos}
                        </h3>
                        <p className="mt-2 text-gray-600">Check back later for new promotional videos.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Videos;