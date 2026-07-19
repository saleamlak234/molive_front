import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    TrendingUp,
    DollarSign,
    Users,
    Award,
    CheckCircle,
    ArrowRight,
    Shield,
    Zap,
    Crown,
    Sparkles,
    Rocket,
    Gift,
    BarChart3,
    Coins,
    Network
} from 'lucide-react';

const AnimatedCounter = ({ target, label, icon: Icon, suffix = '' }: { target: number; label: string; icon: React.ElementType; suffix?: string }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let start = 0;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        const timer = window.setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                window.clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, duration / steps);

        return () => window.clearInterval(timer);
    }, [isVisible, target]);

    return (
        <div ref={ref} className="stat-card group">
            <div className="flex justify-center mb-3">
                <div className="p-3 transition-colors rounded-xl bg-white/10 group-hover:bg-white/20">
                    <Icon className="w-6 h-6 text-emerald-300" />
                </div>
            </div>
            <div className="text-4xl font-bold text-white counter">
                {count}{suffix}
            </div>
            <div className="text-gray-200">{label}</div>
        </div>
    );
};

const Card3D = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
    };

    return (
        <div
            ref={cardRef}
            className={`card-3d ${className}`}
            style={{
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.1s ease-out'
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    );
};

const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const safeCanvas = canvas as HTMLCanvasElement;

        let particles: Array<{
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;
            update: () => void;
            draw: () => void;
        }> = [];
        let animationFrameId = 0;

        const resizeCanvas = () => {
            safeCanvas.width = window.innerWidth;
            safeCanvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;

            constructor() {
                this.x = Math.random() * safeCanvas.width;
                this.y = Math.random() * safeCanvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 2;
                this.speedY = (Math.random() - 0.5) * 2;
                this.opacity = Math.random() * 0.5 + 0.1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > safeCanvas.width) this.x = 0;
                if (this.x < 0) this.x = safeCanvas.width;
                if (this.y > safeCanvas.height) this.y = 0;
                if (this.y < 0) this.y = safeCanvas.height;
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < 100; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((particle) => {
                particle.update();
                particle.draw();
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 150) {
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = window.requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export default function Home() {
    const { user } = useAuth();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('.scroll-animate, .scroll-animate-scale');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const features = [
        {
            icon: DollarSign,
            title: 'High Returns',
            description: '9% daily returns with consistent growth',
            color: 'from-emerald-400 to-emerald-600'
        },
        {
            icon: Network,
            title: 'MLM System',
            description: 'Earn 18% commission from referrals (8%/6%/4%)',
            color: 'from-emerald-500 to-green-600'
        },
        {
            icon: Shield,
            title: 'Secure Platform',
            description: 'Advanced security measures to protect your investments',
            color: 'from-green-400 to-emerald-600'
        },
        {
            icon: Zap,
            title: 'Instant Payouts',
            description: 'Fast payout processing with reliable payment options',
            color: 'from-lime-400 to-green-600'
        }
    ];

    const packages = [
        { name: '8th package', price: 320000, popular: false, level: 8 },
        { name: '7th package', price: 160000, popular: false, level: 7 },
        { name: '6th package', price: 80000, popular: false, level: 6 },
        { name: '5th package', price: 40000, popular: false, level: 5 },
        { name: '4th package', price: 20000, popular: false, level: 4 },
        { name: '3rd package', price: 10000, popular: false, level: 3 },
        { name: '2nd package', price: 5000, popular: true, level: 2 },
        { name: '1st package', price: 2500, popular: false, level: 1 }
    ];

    const vipLevels = [
        { level: 1, badge: 'Bronze', referrals: 13, bonus: 10000, color: 'from-amber-400 to-amber-600', icon: '🥉' },
        { level: 2, badge: 'Silver', referrals: 20, bonus: 17000, color: 'from-gray-300 to-gray-500', icon: '🥈' },
        { level: 3, badge: 'Gold', referrals: 30, bonus: 25000, color: 'from-yellow-400 to-yellow-600', icon: '🥇' },
        { level: 4, badge: 'Platinum', referrals: 40, bonus: 35000, color: 'from-purple-400 to-purple-600', icon: '💎' },
        { level: 5, badge: 'Diamond', referrals: 40, team: 500, bonus: 80000, color: 'from-emerald-400 to-green-600', icon: '💠' },
        { level: 6, badge: 'Master', referrals: 40, team: 1000, bonus: 150000, color: 'from-red-400 to-rose-600', icon: '👑' }
    ];

    const translations = {
        am: {
            vipTitle: 'የVIP ደረጃዎች',
            vipSubtitle: 'በኢትዮጵያ ውስጥ ተጨማሪ ገቢ ለማግኘት የሚያስችል የVIP ደረጃ መረጃ',
            directReferrals: 'ቀጥታ ግብዣ',
            monthlyBonus: 'ወርሃዊ ገቢ',
            birr: 'ብር'
        },
        ti: {
            vipTitle: 'VIP ደረጃታት',
            vipSubtitle: 'ብኢትዮጵያ ውስጢ ተወሳኺ ኣታዊ ንምርካብ ዝሕግዝ VIP ደረጃ ሓበሬታ',
            directReferrals: 'ቀጥታዊ ዓድማት',
            monthlyBonus: 'ወርሓዊ ጉርሻ',
            birr: 'ብር'
        },
        or: {
            vipTitle: 'Sadarkaalee VIP',
            vipSubtitle: 'Itoophiyaa keessatti galii dabalataa argachuuf gargaaru odeeffannoo sadarkaa VIP',
            directReferrals: 'Afeerraa kallattii',
            monthlyBonus: 'Badhaasa ji\'aa',
            birr: 'birr'
        }
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 to-white">
            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.1); }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-in-left {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }

                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float 3s ease-in-out infinite 1s;
                }
                .animate-pulse-glow {
                    animation: pulse-glow 4s ease-in-out infinite;
                }
                .animate-slide-up {
                    animation: slide-up 0.6s ease-out forwards;
                }
                .animate-slide-left {
                    animation: slide-in-left 0.6s ease-out forwards;
                }
                .animate-scale-in {
                    animation: scale-in 0.5s ease-out forwards;
                }

                .stat-card {
                    padding: 1.5rem;
                    text-align: center;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease;
                }
                .stat-card:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.05);
                }

                .card-3d {
                    transition: transform 0.1s ease-out;
                }

                .vip-card {
                    transition: all 0.3s ease;
                }
                .vip-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }

                .package-card {
                    transition: all 0.3s ease;
                }
                .package-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }

                .feature-card {
                    transition: all 0.3s ease;
                }
                .feature-card:hover {
                    transform: translateY(-5px) scale(1.02);
                }

                .table-row {
                    transition: all 0.2s ease;
                }
                .table-row:hover {
                    background: rgba(16, 185, 129, 0.05);
                }

                .scroll-animate {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.8s ease-out;
                }
                .scroll-animate.visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .scroll-animate-scale {
                    opacity: 0;
                    transform: scale(0.8);
                    transition: all 0.8s ease-out;
                }
                .scroll-animate-scale.visible {
                    opacity: 1;
                    transform: scale(1);
                }
            `}</style>

            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900">
                    <ParticleBackground />
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute rounded-full top-20 left-10 w-72 h-72 bg-emerald-500 mix-blend-multiply filter blur-3xl animate-pulse-glow"></div>
                        <div className="absolute bg-green-500 rounded-full bottom-20 right-10 w-96 h-96 mix-blend-multiply filter blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-teal-500 rounded-full top-1/2 left-1/2 w-80 h-80 mix-blend-multiply filter blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
                    </div>
                </div>

                <div className="relative px-4 py-32 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-white transition-transform border rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:scale-105">
                            <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                            <span>Trusted by 100,000+ Investors</span>
                        </div>

                        <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl animate-slide-up">
                            Welcome to{' '}
                            <span className="text-transparent bg-gradient-to-r from-emerald-300 via-green-400 to-lime-300 bg-clip-text animate-gradient">
                                Colgate-Palmolive
                            </span>
                        </h1>

                        <p className="max-w-3xl mx-auto mb-8 text-xl text-white/80 md:text-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            A global consumer products company specializing in oral care, personal care,
                            home care, and trusted household brands built over 200 years
                        </p>

                        <div className="flex flex-col items-center justify-center gap-4 mb-16 sm:flex-row animate-slide-up" style={{ animationDelay: '0.4s' }}>
                            {!user ? (
                                <>
                                    <Link
                                        to="/register"
                                        className="relative inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-black transition-all duration-300 rounded-full shadow-2xl group bg-gradient-to-r from-emerald-400 to-green-500 shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
                                    >
                                        <span>Start Investing Today</span>
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="px-8 py-4 text-lg font-semibold text-white transition-all duration-300 border-2 rounded-full border-white/30 backdrop-blur-sm hover:bg-white/10 hover:border-white/50 hover:scale-105"
                                    >
                                        Login
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    to="/dashboard"
                                    className="relative inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-black transition-all duration-300 rounded-full shadow-2xl group bg-gradient-to-r from-emerald-400 to-green-500 shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
                                >
                                    <span>Go to Dashboard</span>
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            )}
                        </div>

                        <div className="grid max-w-4xl grid-cols-1 gap-6 mx-auto md:grid-cols-3">
                            <AnimatedCounter target={9} label="Daily Returns" icon={TrendingUp} suffix="%" />
                            <AnimatedCounter target={18} label="Referral Commission" icon={Users} suffix="%" />
                            <AnimatedCounter target={100000} label="Active Investors" icon={Users} suffix="+" />
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 w-full overflow-hidden">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]">
                        <path d="M0,0 C300,120 900,120 1200,0 L1200,120 L0,120 Z" className="fill-slate-50"></path>
                    </svg>
                </div>
            </section>

            <section className="py-24 bg-slate-50">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-sm font-medium transition-transform rounded-full text-emerald-700 bg-emerald-100 hover:scale-105">
                            <Rocket className="w-4 h-4" />
                            <span>Why Choose Us</span>
                        </div>
                        <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl scroll-animate">
                            About Colgate-Palmolive
                        </h2>
                        <p className="max-w-3xl mx-auto text-xl text-gray-600 scroll-animate">
                            Colgate-Palmolive is a global leader in consumer products, delivering trusted
                            oral care, personal care and home care brands that improve everyday life.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div key={index} className="feature-card scroll-animate-scale">
                                    <Card3D className="relative p-8 bg-white shadow-lg group rounded-2xl hover:shadow-2xl">
                                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} mb-5 shadow-lg transition-all duration-300 group-hover:rotate-12 group-hover:scale-110`}>
                                            <IconComponent className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="mb-3 text-xl font-bold text-gray-900">{feature.title}</h3>
                                        <p className="text-gray-600">{feature.description}</p>
                                        <div className="absolute bottom-0 left-0 w-full h-1 transition-transform duration-500 scale-x-0 bg-gradient-to-r from-transparent via-emerald-500 to-transparent group-hover:scale-x-100"></div>
                                    </Card3D>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-white">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-sm font-medium transition-transform rounded-full text-emerald-700 bg-emerald-100 hover:scale-105">
                            <Coins className="w-4 h-4" />
                            <span>Investment Packages</span>
                        </div>
                        <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl scroll-animate">
                            Choose Your Package
                        </h2>
                        <p className="max-w-3xl mx-auto text-xl text-gray-600 scroll-animate">
                            Select the perfect investment plan that matches your goals
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {packages.map((pkg, index) => (
                            <div key={index} className={`package-card scroll-animate-scale ${pkg.popular ? 'lg:scale-105' : ''}`}>
                                <Card3D className="relative h-full p-8 transition-all duration-500 bg-white border-2 border-gray-100 shadow-lg rounded-2xl hover:shadow-2xl hover:border-emerald-200">
                                    {pkg.popular && (
                                        <div className="absolute transform -translate-x-1/2 -top-4 left-1/2 animate-float">
                                            <span className="px-6 py-1.5 text-sm font-bold text-black bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow-lg shadow-emerald-500/30">
                                                Most Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 transition-all duration-300 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 hover:rotate-180">
                                            <span className="text-2xl font-bold text-emerald-700">{pkg.level}</span>
                                        </div>
                                        <h3 className="mb-2 text-xl font-bold text-gray-900">{pkg.name}</h3>
                                        <div className="mb-1 text-3xl font-bold transition-all duration-300 text-emerald-600 hover:scale-110 hover:text-emerald-700">
                                            {pkg.price.toLocaleString()} ETB
                                        </div>
                                        <div className="mb-6 text-sm text-gray-500">Initial Investment</div>

                                        <div className="mb-6 space-y-3">
                                            {[
                                                '9% daily returns (5%/3%/1%)',
                                                '18% referral Commission (8%/6%/4%)',
                                                'MLM Commission Eligible',
                                                '24/7 Support'
                                            ].map((feature, idx) => (
                                                <div key={idx} className="flex items-center text-sm text-gray-600 transition-transform hover:translate-x-1">
                                                    <CheckCircle className="flex-shrink-0 w-4 h-4 mr-2 text-emerald-500" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {!user ? (
                                            <Link
                                                to="/register"
                                                className={`block w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 text-center ${pkg.popular
                                                    ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-black shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105'
                                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105'
                                                }`}
                                            >
                                                Get Started
                                            </Link>
                                        ) : (
                                            <Link
                                                to="/deposits"
                                                className={`block w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 text-center ${pkg.popular
                                                    ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-black shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105'
                                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105'
                                                }`}
                                            >
                                                Invest Now
                                            </Link>
                                        )}
                                    </div>
                                </Card3D>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-sm font-medium transition-transform rounded-full text-emerald-700 bg-emerald-100 hover:scale-105">
                            <Crown className="w-4 h-4" />
                            <span>VIP Program</span>
                        </div>
                        <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl scroll-animate">
                            VIP Levels & Bonuses
                        </h2>

                        <div className="max-w-4xl mx-auto space-y-4 scroll-animate">
                            <div className="p-6 border rounded-2xl bg-gradient-to-r from-emerald-50 to-green-100 border-emerald-200">
                                <h3 className="mb-2 text-xl font-bold text-emerald-800">{translations.am.vipTitle}</h3>
                                <p className="text-emerald-700">{translations.am.vipSubtitle}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="p-4 transition-transform border rounded-xl bg-emerald-50 border-emerald-100 hover:scale-105">
                                    <h4 className="mb-1 font-semibold text-emerald-800">{translations.ti.vipTitle}</h4>
                                    <p className="text-sm text-emerald-700">{translations.ti.vipSubtitle}</p>
                                </div>
                                <div className="p-4 transition-transform border border-green-100 rounded-xl bg-green-50 hover:scale-105">
                                    <h4 className="mb-1 font-semibold text-green-800">{translations.or.vipTitle}</h4>
                                    <p className="text-sm text-green-700">{translations.or.vipSubtitle}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {vipLevels.map((vip, index) => (
                            <div key={index} className="vip-card scroll-animate-scale">
                                <Card3D className="relative h-full p-6 bg-white border border-gray-100 shadow-lg rounded-2xl hover:shadow-2xl">
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${vip.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                                    <div className="relative">
                                        <div className="text-center">
                                            <div className="inline-block mb-3 text-5xl transition-all duration-300 hover:scale-125 hover:rotate-12">
                                                {vip.icon}
                                            </div>
                                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${vip.color} mb-4 shadow-lg transition-all duration-300 hover:scale-110`}>
                                                <span className="text-2xl font-bold text-white">{vip.level}</span>
                                            </div>
                                            <h3 className="mb-2 text-xl font-bold text-gray-900">
                                                {vip.badge}
                                            </h3>

                                            <div className="mb-4 space-y-3">
                                                <div className="p-3 transition-transform rounded-xl bg-gray-50 hover:scale-105">
                                                    <p className="text-xs tracking-wider text-gray-500 uppercase">Direct Referrals</p>
                                                    <p className="text-lg font-bold text-gray-900">{vip.referrals}+</p>
                                                </div>
                                                <div className="p-3 transition-transform rounded-xl bg-emerald-50 hover:scale-105">
                                                    <p className="text-xs tracking-wider uppercase text-emerald-600">Monthly Bonus</p>
                                                    <p className="text-xl font-bold text-emerald-700">
                                                        {vip.bonus.toLocaleString()} ETB
                                                    </p>
                                                </div>
                                                {vip.team && (
                                                    <div className="p-3 transition-transform rounded-xl bg-green-50 hover:scale-105">
                                                        <p className="text-xs tracking-wider text-green-600 uppercase">Team Size</p>
                                                        <p className="text-lg font-bold text-green-700">{vip.team}+</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-3 border-t border-gray-100">
                                                <div className="text-xs text-gray-400 space-y-0.5">
                                                    <p>ትግርኛ: {vip.referrals} ቀጥታዊ ዓድማት</p>
                                                    <p>ኦሮምኛ: {vip.referrals} afeerraa kallattii</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card3D>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-white">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-sm font-medium transition-transform rounded-full text-emerald-700 bg-emerald-100 hover:scale-105">
                            <BarChart3 className="w-4 h-4" />
                            <span>Commission Structure</span>
                        </div>
                        <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl scroll-animate">
                            Deposit Packages & Daily Commissions
                        </h2>
                        <p className="max-w-3xl mx-auto text-xl text-gray-600 scroll-animate">
                            See exactly how much you can earn from each package and referral level.
                        </p>
                    </div>

                    <div className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl scroll-animate-scale">
                        <div className="p-8 text-center bg-gradient-to-r from-emerald-600 to-green-600">
                            <h3 className="text-2xl font-bold text-white">Complete Commission Breakdown</h3>
                            <p className="mt-2 text-emerald-100">Standard deposit packages with fixed commissions and daily payout values</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase border-r border-gray-200">Level</th>
                                        <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase border-r border-gray-200">Package</th>
                                        <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase border-r border-gray-200">8% Comm</th>
                                        <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase border-r border-gray-200">6% Comm</th>
                                        <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase border-r border-gray-200">4% Comm</th>
                                        <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase border-r border-gray-200">Daily Comm</th>
                                        <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase border-r border-gray-200">Daily 5%</th>
                                        <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase border-r border-gray-200">Daily 3%</th>
                                        <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase">Daily 1%</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {[
                                        { level: 1, price: 2500, comm: [200, 150, 100], daily: 80, dailyPcts: [4, 2.4, 0.8] },
                                        { level: 2, price: 5000, comm: [400, 300, 200], daily: 162, dailyPcts: [8.1, 4.86, 1.62] },
                                        { level: 3, price: 10000, comm: [800, 600, 400], daily: 330, dailyPcts: [16.1, 9.9, 3.3] },
                                        { level: 4, price: 20000, comm: [1600, 1200, 800], daily: 670, dailyPcts: [33.5, 20.1, 6.7] },
                                        { level: 5, price: 40000, comm: [3200, 2400, 1600], daily: 1350, dailyPcts: [67.5, 40.5, 13.5] },
                                        { level: 6, price: 80000, comm: [6400, 4800, 3200], daily: 2750, dailyPcts: [137.5, 82.5, 13.5] },
                                        { level: 7, price: 160000, comm: [12800, 9600, 6400], daily: 5520, dailyPcts: [276, 165.6, 55.2] },
                                        { level: 8, price: 320000, comm: [25600, 18200, 12800], daily: 11040, dailyPcts: [552, 331.2, 110.4] }
                                    ].map((row, idx) => (
                                        <tr key={idx} className="table-row" style={{ animation: 'slide-in-left 0.5s ease-out forwards', animationDelay: `${idx * 0.05}s`, opacity: 0 }}>
                                            <td className="px-4 py-4 font-bold text-center text-gray-900 border-r border-gray-100">{row.level}</td>
                                            <td className="px-4 py-4 font-semibold text-center border-r border-gray-100 text-emerald-600">{row.price.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-center border-r border-gray-100 text-emerald-600">{row.comm[0].toLocaleString()}</td>
                                            <td className="px-4 py-4 text-center text-green-600 border-r border-gray-100">{row.comm[1].toLocaleString()}</td>
                                            <td className="px-4 py-4 text-center border-r border-gray-100 text-lime-600">{row.comm[2].toLocaleString()}</td>
                                            <td className="px-4 py-4 text-center text-orange-600 border-r border-gray-100">{row.daily.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-center border-r border-gray-100 text-amber-600">{row.dailyPcts[0]}</td>
                                            <td className="px-4 py-4 text-center border-r border-gray-100 text-amber-600">{row.dailyPcts[1]}</td>
                                            <td className="px-4 py-4 text-center text-amber-600">{row.dailyPcts[2]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-8 border-t bg-gradient-to-r from-emerald-50 to-green-100 border-emerald-200">
                            <div className="max-w-2xl mx-auto text-center">
                                <div className="w-12 h-12 mx-auto mb-4 text-emerald-600 animate-float">
                                    <Award className="w-12 h-12" />
                                </div>
                                <h3 className="mb-2 text-2xl font-bold text-gray-900">Total Commission: 18%</h3>
                                <p className="text-gray-600">
                                    Every time someone in your network makes a deposit or earns,
                                    you get your share of the commission automatically.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-emerald-500 filter blur-3xl animate-float"></div>
                        <div className="absolute bottom-0 right-0 bg-green-500 rounded-full w-96 h-96 filter blur-3xl animate-float-delayed"></div>
                    </div>
                </div>

                <div className="relative max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
                    <div className="scroll-animate-scale">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-white transition-transform border rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:scale-105">
                            <Gift className="w-4 h-4" />
                            <span>Start Your Journey Today</span>
                        </div>

                        <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl animate-float">
                            Ready to Start Building Wealth?
                        </h2>
                        <p className="mb-8 text-xl text-white/80">
                            Join millions of customers who trust Colgate-Palmolive products worldwide.
                            Discover our trusted brands and how they make everyday life better.
                        </p>

                        {!user ? (
                            <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-black transition-all duration-300 rounded-full shadow-2xl group bg-gradient-to-r from-emerald-400 to-green-500 shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
                                >
                                    <span>Start Investing Now</span>
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-8 py-4 text-lg font-semibold text-white transition-all duration-300 border-2 rounded-full border-white/30 backdrop-blur-sm hover:bg-white/10 hover:border-white/50 hover:scale-105"
                                >
                                    Login to Account
                                </Link>
                            </div>
                        ) : (
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-black transition-all duration-300 rounded-full shadow-2xl group bg-gradient-to-r from-emerald-400 to-green-500 shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
                            >
                                <span>View Your Dashboard</span>
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
