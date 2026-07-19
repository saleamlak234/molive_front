
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { env } from '../config/env';
import axios from 'axios';
import brandLogo from '../assets/logo.png';
import NotificationBanner from './NotificationBanner';
import ThemeToggle from './ThemeToggle';
import {
  User,
  Menu,
  X,
  LogOut,
  DollarSign,
  Award,
  Shield,
  Crown,
  Trophy,
  Zap,
  CheckCircle,
  PlayCircle,
  CreditCard,
} from 'lucide-react';
// import PackageSlider from './PackageSlider';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [videoRewards, setVideoRewards] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchVideoRewards();
      fetchPendingApprovalsCount();
    }

    fetchAdminNotifications();
  }, [user]);

  const fetchAdminNotifications = async () => {
    try {
      const response = await axios.get('/notifications/active');
      setAdminNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      setAdminNotifications([]);
    }
  };
  const fetchPendingApprovalsCount = async () => {
    try {
      const response = await axios.get('/user/referral-deposits');
      const count = response.data.count ?? (response.data.deposits?.length ?? 0);
      setPendingApprovalsCount(count);
    } catch (error) {
      console.error('Error fetching pending approvals count:', error);
      setPendingApprovalsCount(0);
    }
  };
  const fetchVideoRewards = async () => {
    try {
      const response = await axios.get('/videos/rewards/today');
      setVideoRewards(response.data.todayRewards || 0);
    } catch (error) {
      console.error('Error fetching video rewards:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const getVipBadgeIcon = (vipBadge: string) => {
    switch (vipBadge) {
      case 'bronze': return <Award className="w-4 h-4 text-orange-600" />;
      case 'silver': return <Award className="w-4 h-4 text-gray-500" />;
      case 'gold': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'platinum': return <Crown className="w-4 h-4 text-purple-600" />;
      case 'diamond': return <Trophy className="w-4 h-4 text-emerald-600" />;
      case 'master': return <Zap className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/70 bg-white/95 shadow-[0_8px_30px_rgba(16,185,129,0.08)] backdrop-blur-xl dark:border-emerald-900/40 dark:bg-gray-900/90">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_50%)] pointer-events-none" />
      <div className="absolute z-50 flex flex-col gap-3 right-4 top-4">
        {adminNotifications.map((note) => (
          <NotificationBanner
            key={note._id}
            title={note.title}
            message={note.message}
            countdownDuration={3}
          />
        ))}
      </div>
      {/* Package Slider */}
      {/* <PackageSlider /> */}

      {/* Main Header */}
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30">
              <img src={brandLogo} alt="Brand Logo" className="h-6 w-6 rounded-full" />
            </div>

            <span className="text-xl font-semibold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent dark:from-emerald-300 dark:to-green-400">{env.APP_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="items-center hidden space-x-8 md:flex">
            <Link to="/" className="text-slate-700 transition-colors hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">
              Home
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-slate-700 transition-colors hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">
                  Dashboard
                </Link>
                <Link to="/deposits" className="text-slate-700 transition-colors hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">
                  Deposits
                </Link>
                <Link to="/commissions" className="text-slate-700 transition-colors hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">
                  Commissions
                </Link>
                <Link to="/transaction-history" className="text-slate-700 transition-colors hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">
                  Credit History
                </Link>
                <Link to="/withdraw" className="text-slate-700 transition-colors hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">
                  Withdrawal
                </Link>
                <Link to="/videos" className="flex items-center space-x-1 text-emerald-700 transition-colors hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300">
                  <PlayCircle className="w-4 h-4" />
                  <span>Videos</span>
                </Link>
                <Link to="/mlm-tree" className="text-slate-700 transition-colors hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">
                  Tree
                </Link>
                <Link to="/referral-approvals" className="relative text-slate-700 transition-colors hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">
                  Approvals
                  {pendingApprovalsCount > 0 && (
                    <sup className="absolute -top-2 right-0 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1.5 text-[0.65rem] font-semibold text-white leading-none">
                      {pendingApprovalsCount}
                    </sup>
                  )}
                </Link>
                <Link to="/vip-levels" className="flex items-center space-x-1 font-medium transition-colors text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                  <Crown className="w-4 h-4" />
                  <span>VIP</span>
                </Link>
                {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'transaction_admin') && (
                  <Link to="/admin" className="font-medium text-rose-600 transition-colors hover:text-rose-700">
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {user && (user.pendingUplineCredit || 0) > 0 && (
            <button
              onClick={() => navigate('/deposits?payCredit=true')}
              className="items-center hidden px-3 py-2 mr-4 text-sm font-semibold text-orange-700 transition-colors bg-orange-100 rounded-full hover:bg-orange-200 xl:flex"
            >
              <CreditCard className="w-4 h-4 mr-2 text-orange-600" />
              <span>
                Pending credit: {(user.pendingUplineCredit || 0).toLocaleString()} ETB (Manual payment required)
              </span>
            </button>
          )}

          {/* User Menu */}
          <div className="items-center hidden space-x-4 md:flex">
            <ThemeToggle />
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-slate-700 transition-all hover:border-emerald-300 hover:text-emerald-700"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user.fullName}</span>
                  {user.vipBadge && user.vipBadge !== 'none' && (
                    <div className="flex items-center space-x-1">
                      {getVipBadgeIcon(user.vipBadge)}
                      <span className="text-xs font-bold text-gold-600">VIP {user.vipLevel}</span>
                    </div>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 z-50 py-2 mt-2 transition-colors bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-700 dark:border-gray-600 w-80">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        {user.vipBadge && user.vipBadge !== 'none' && (
                          <div className="flex items-center px-2 py-1 space-x-1 rounded-full bg-gold-100 dark:bg-gold-900">
                            {getVipBadgeIcon(user.vipBadge)}
                            <span className="text-xs font-bold text-gold-800 dark:text-gold-200">
                              VIP {user.vipLevel}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Balance:</span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {(user.balance || 0).toLocaleString()} ETB
                        </span>
                      </div>
                      {videoRewards > 0 && (
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Video Rewards:</span>
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            +{videoRewards.toLocaleString()} ETB
                          </span>
                        </div>
                      )}
                      {user.pendingUplineCredit && user.pendingUplineCredit > 0 ? (
                        <>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Pending Credit:</span>
                            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                              {(user.pendingUplineCredit || 0).toLocaleString()} ETB
                            </span>
                          </div>
                          <div className="px-3 py-2 mt-2 text-sm text-orange-700 bg-orange-100 rounded-lg dark:text-orange-200 dark:bg-orange-900">
                            Pending credit requires a manual payment request and approval by your referrer.
                          </div>
                        </>
                      ) : (
                        <div className="px-3 py-2 mt-2 text-sm text-green-700 bg-green-100 rounded-lg dark:text-green-200 dark:bg-green-900">
                          Pending credit cleared. Video rewards and daily returns are active.
                        </div>
                      )}
                    </div>

                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-emerald-400"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        to="/vip-levels"
                        className="flex items-center px-4 py-2 text-sm text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Crown className="w-4 h-4 mr-3" />
                        VIP
                      </Link>
                      <Link
                        to="/deposits"
                        className="flex items-center px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <DollarSign className="w-4 h-4 mr-3" />
                        Deposits
                      </Link>
                      <Link
                        to="/commissions"
                        className="flex items-center px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Award className="w-4 h-4 mr-3" />
                        Commissions
                      </Link>
                      <Link
                        to="/referral-approvals"
                        className="flex items-center px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <CheckCircle className="w-4 h-4 mr-3" />
                        Approvals
                      </Link>
                      {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'transaction_admin') && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4 mr-3" />
                          Admin Panel
                        </Link>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-slate-700 transition-colors hover:text-emerald-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] hover:shadow-emerald-500/30"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile theme toggle and menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-md border border-emerald-100 bg-emerald-50 p-2 text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="py-4 border-t border-gray-200 md:hidden">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-gray-700 transition-colors hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 transition-colors hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/vip-levels"
                    className="font-medium transition-colors text-emerald-600 hover:text-emerald-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    VIP Levels
                  </Link>
                  <Link
                    to="/deposits"
                    className="text-gray-700 transition-colors hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Deposits
                  </Link>
                  <Link
                    to="/commissions"
                    className="text-gray-700 transition-colors hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Commissions
                  </Link>
                  <Link
                    to="/videos"
                    className="text-emerald-700 transition-colors hover:text-emerald-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <PlayCircle className="inline w-4 h-4 mr-2 " />
                    Videos
                  </Link>
                  <Link
                    to="/mlm-tree"
                    className="text-gray-700 transition-colors hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tree
                  </Link>
                   <Link to="/transaction-history" className="text-gray-700 transition-colors dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                  Credit History
                </Link>
                <Link to="/withdraw" className="text-gray-700 transition-colors dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                  Withdrawal
                </Link>
                  <Link
                    to="/referral-approvals"
                    className="relative text-slate-700 transition-colors hover:text-emerald-600"

                    onClick={() => setIsMenuOpen(false)}
                  >
                    Approvals
                    {pendingApprovalsCount > 0 && (
                      <sup className="absolute -top-2 right-0 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1.5 text-[0.65rem] font-semibold text-white leading-none">
                        {pendingApprovalsCount}
                      </sup>
                    )}
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 transition-colors hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'transaction_admin') && (
                    <Link
                      to="/admin"
                      className="font-medium text-red-600 transition-colors hover:text-red-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-red-600 hover:text-red-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 transition-colors hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-center text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}
    </header>
  );
}