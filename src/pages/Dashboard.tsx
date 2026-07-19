import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { env } from '../config/env';
import {
  DollarSign,
  TrendingUp,
  Users,
  Award,
  ArrowUpRight,
  Eye,
  Copy,
  CheckCircle,
  CreditCard,
  Smartphone
} from 'lucide-react';
import axios from 'axios';
import SpinWheel from '../components/SpinWheel';

interface DashboardStats {
  totalBalance: number;
  totalDeposits: number;
  totalCommissions: number;
  totalPaidBalance?: number;
  pendingUplineCredit?: number;
  creditBlocked?: boolean;
  monthlyEarnings: number;
  directReferrals: number;
  totalTeamSize: number;
  todaysDirectReferrals: number;
  todaysDirectReferralReward: number;
  dailyReferralReward: number;
  recentTransactions: Transaction[];
}

interface Transaction {
  id: string;
  type: 'deposit' | 'commission';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
  description?: string;
  isManual?: boolean;
  adminName?: string | null;
}

interface MerchantAccount {
  _id: string;
  name: string;
  type: 'bank' | 'mobile_money';
  accountNumber: string;
  accountName: string;
  bankName?: string;
  phoneNumber?: string;
  instructions: string;
}

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [merchantAccounts, setMerchantAccounts] = useState<MerchantAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReferralCode, setShowReferralCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [showUplinePaymentModal, setShowUplinePaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    reference: ''
  });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [selectedMerchantAccountId, setSelectedMerchantAccountId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [claimingReferralReward, setClaimingReferralReward] = useState(false);

  const rewardSegments = [49, 99, 199, 499, 999, 2499];
  const getTargetIndexFromCount = (count: number) => {
    if (count <= 1) return 0;
    if (count === 2) return 1;
    if (count === 3) return 2;
    if (count === 4) return 3;
    if (count === 5) return 4;
    return 5;
  };
  const getRewardFromCount = (count: number) => rewardSegments[getTargetIndexFromCount(count)];

  const handleTargetHit = async (_segment: string) => {
    if (claimingReferralReward) return;
    setClaimingReferralReward(true);
    try {
      const response = await axios.post('/dashboard/claim-direct-referral-reward');
      await fetchDashboardData();
      if (response?.data?.message) {
        window.alert(response.data.message);
      }
    } catch (error: any) {
      console.error('Claim referral reward failed:', error);
      window.alert(
        error?.response?.data?.message ||
        'Failed to claim referral wheel reward. Please try again.',
      );
    } finally {
      setClaimingReferralReward(false);
    }
  };

  const displayedBalance = stats?.totalBalance ?? user?.balance ?? 0;

  useEffect(() => {
    if (merchantAccounts.length && !selectedMerchantAccountId) {
      setSelectedMerchantAccountId(merchantAccounts[0]._id);
      setPaymentMethod(merchantAccounts[0].type);
    }
  }, [merchantAccounts, selectedMerchantAccountId]);

  //   fetchDashboardData();
  // }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, merchantResponse] = await Promise.all([
        axios.get('/dashboard/stats'),
        axios.get('/deposits/merchant-accounts')
      ]);

      setStats(statsResponse.data);
      setMerchantAccounts(merchantResponse.data.merchantAccounts);

      if (updateUser) {
        updateUser({
          pendingUplineCredit: statsResponse.data.pendingUplineCredit,
          creditBlocked: statsResponse.data.creditBlocked,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (user?.referralCode) {
      try {
        await navigator.clipboard?.writeText(user.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Silent fail if clipboard not available
      }
    }
  };


  const handleSubmitUplinePayment = async () => {
    if (!paymentAmount.trim() || Number(paymentAmount) <= 0) {
      alert('Credit amount is required.');
      return;
    }

    if (!selectedMerchantAccountId) {
      alert('Please select a merchant account.');
      return;
    }

    if (!paymentForm.reference.trim()) {
      alert('Please provide a transaction reference.');
      return;
    }

    if (!receiptFile) {
      alert('Please upload your payment receipt.');
      return;
    }

    setSubmittingPayment(true);
    try {
      const formData = new FormData();
      formData.append('package', 'Credit Payment');
      formData.append('amount', paymentAmount);
      formData.append('paymentMethod', paymentMethod);
      formData.append('merchantAccountId', selectedMerchantAccountId);
      formData.append('transactionReference', paymentForm.reference.trim());
      formData.append('receipt', receiptFile);

      await axios.post('/deposits', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowUplinePaymentModal(false);
      setPaymentForm({ reference: '' });
      setReceiptFile(null);
      setPaymentAmount('');
      await fetchDashboardData();
      alert('Credit payment submitted successfully! Awaiting approval like a normal deposit.');
    } catch (error: any) {
      console.error('Error submitting upline payment:', error);
      alert(error?.response?.data?.message || 'Failed to submit payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  function copyTextFallback(text: string) {
    let textarea: HTMLTextAreaElement | null = null;
    try {
      textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '1px';
      textarea.style.height = '1px';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      const successful = document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      return successful;
    } catch (err) {
      console.error('Error in copyTextFallback:', err);
      return false;
    } finally {
      if (textarea && textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
    }
  }

  function copyText(text: string) {
    let textarea: HTMLTextAreaElement | null = null;
    try {
      textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '1px';
      textarea.style.height = '1px';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      const successful = document.execCommand('copy');
      return successful;
    } catch (err) {
      console.error('Error in copying:', err);
      return false;
    } finally {
      if (textarea && textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
    }
  }

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      // fallback to old method
      copyText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
    }
  };

  // const referralLink = `http://molivetradingplc.com/register?ref=${user?.referralCode}`;
  // // 

  const referralLink = `${env.DOMAIN}/register?ref=${user?.referralCode}`;
  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleBalanceUpdate = () => {
      fetchDashboardData();
    };

    window.addEventListener('balance:updated', handleBalanceUpdate);
    return () => {
      window.removeEventListener('balance:updated', handleBalanceUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="mt-1 text-gray-600">
            Here's an overview of your investment portfolio and earnings
          </p>
        </div>

        {/* Spin Wheel Demo */}
        <div className="p-6 mb-8 bg-white border border-gray-200 shadow-sm rounded-xl">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Referral Spin Wheel</h2>
          <p className="mb-4 text-sm text-gray-600">Click the center button on the wheel to spin to your referral reward.</p>
          <div className="max-w-md">
            <SpinWheel
              segments={['49', '99', '199', '499', '999', '2499']}
              targetIndex={getTargetIndexFromCount(stats?.todaysDirectReferrals || 0)}
              hasReferral={Boolean(stats?.todaysDirectReferrals)}
              disabled={claimingReferralReward}
              onTarget={(segment) => handleTargetHit(segment)}
            />

            <div className="mt-4">
              <span className="text-sm text-gray-600">
                Spin the wheel to claim your referral reward.
              </span>
            </div>
          </div>
        </div>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayedBalance.toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="w-4 h-4 mr-1 text-green-500" />
              <span className="text-green-600">Available balance</span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deposits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalDeposits || user?.totalDeposits || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">Total invested amount</span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Commissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalCommissions || user?.totalCommissions || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-purple-600">From referral network</span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Paid Balances</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalPaidBalance || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <CreditCard className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-yellow-600">Total commissions plus all self video rewards from the start</span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Direct Referrals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.todaysDirectReferrals || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">Direct invites today</span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Direct Referral Reward</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.todaysDirectReferralReward || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-teal-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-teal-600">From today's direct referral deposits</span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Upline Video Referral Reward</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.dailyReferralReward || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 rounded-full bg-cyan-100">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-cyan-600">From today's qualified upline video rewards</span>
            </div>
          </div>

          <div className={`p-6 border border-gray-200 shadow-sm rounded-xl ${(stats?.pendingUplineCredit || 0) > 0 ? 'bg-white' : 'bg-green-50'
            }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Upline Credit</p>
                <p className={`text-2xl font-bold ${(stats?.pendingUplineCredit || 0) > 0 ? 'text-red-900' : 'text-green-700'
                  }`}>
                  {(stats?.pendingUplineCredit || 0).toLocaleString()} ETB
                </p>
              </div>
              {(stats?.pendingUplineCredit || 0) > 0 ? (
                <button
                  onClick={() => navigate('/deposits?payCredit=true')}
                  className="p-3 transition-colors bg-red-100 rounded-full hover:bg-red-200"
                  title="Click to submit upline credit payment"
                >
                  <CreditCard className="w-6 h-6 text-red-600" />
                </button>
              ) : (
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              )}
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className={`${(stats?.pendingUplineCredit || 0) > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                {(stats?.pendingUplineCredit || 0) > 0
                  ? 'If your balance is enough, this will be deducted automatically; otherwise submit a manual payment.'
                  : 'Credit cleared. Video rewards and daily returns are now active.'}
              </span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalTeamSize || user?.totalTeamSize || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">
                {stats?.directReferrals || user?.directReferrals || 0} direct referrals
              </span>
            </div>
          </div>
        </div>

        {(stats?.pendingUplineCredit || 0) > 0 ? (
          <div className="p-6 mb-8 text-sm text-orange-800 border border-orange-200 bg-orange-50 rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-orange-900">Pending upline credit</p>
                <p className="mt-1 text-gray-700">
                  You currently owe {(stats?.pendingUplineCredit || 0).toLocaleString()} ETB in upline credit. If your available balance is enough, it will be deducted automatically to clear this amount. If not, click the card icon to submit a manual payment with receipt for approval by your upline parent.
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase bg-orange-600 rounded-full">
                Manual payment required
              </span>
            </div>
          </div>
        ) : (
          <div className="p-6 mb-8 text-sm text-green-800 border border-green-200 bg-green-50 rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-green-900">Credit cleared</p>
                <p className="mt-1 text-gray-700">
                  Your pending credit is cleared. You can now earn video rewards and daily returns normally.
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase bg-green-600 rounded-full">
                Rewards active
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Spin Target</h3>
              <SpinWheel
                segments={['49', '99', '199', '499', '999', '2499']}
                targetIndex={getTargetIndexFromCount(stats?.todaysDirectReferrals || 0)}
                hasReferral={Boolean(stats?.todaysDirectReferrals)}
                disabled={claimingReferralReward}
                onTarget={(segment) => handleTargetHit(segment)}
              />
            </div>

            {/* Referral Section */}
            <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Referral Program</h3>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Your Referral Code
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                      <span className="font-mono text-lg font-semibold text-primary-600">
                        {showReferralCode ? user?.referralCode : '••••••••'}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowReferralCode(!showReferralCode)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={copyReferralCode}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      {copied ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => referralLink && copyTextFallback(referralLink)}
                  className="w-full px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  {copied ? 'Link Copied!' : 'Copy Referral Link'}
                </button>

                <div className="p-4 rounded-lg bg-gradient-to-r from-gold-50 to-gold-100">
                  <h4 className="mb-2 font-semibold text-gold-800">Commission Structure</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gold-700">Level 1:</span>
                      <span className="font-semibold text-gold-800">8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gold-700">Level 2:</span>
                      <span className="font-semibold text-gold-800">6%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gold-700">Level 3:</span>
                      <span className="font-semibold text-gold-800">4%</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Merchant Accounts */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Payment Accounts</h3>

              <div className="space-y-4">
                {merchantAccounts.map((account) => (
                  <div key={account._id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {account.type === 'bank' ? (
                          <CreditCard className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Smartphone className="w-5 h-5 text-green-600" />
                        )}
                        <h4 className="font-semibold text-gray-900">{account.name}</h4>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{account.type === 'bank' ? 'Account:' : 'Phone:'}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono">{account.type === 'bank' ? account.accountNumber : account.phoneNumber}</span>
                          <button
                            onClick={() => copyToClipboard(account.type === 'bank' ? account.accountNumber || '' : account.phoneNumber || '')}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            {copiedText === (account.type === 'bank' ? account.accountNumber : account.phoneNumber) ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span>{account.accountName}</span>
                      </div>
                      {account.bankName && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Bank:</span>
                          <span>{account.bankName}</span>
                        </div>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  <p className="text-sm text-gray-500">
                    Your latest deposits and credited earnings.
                  </p>
                </div>
                <Link
                  to="/video-rewards-history"
                  className="px-4 py-2 text-sm font-medium border rounded-lg text-primary-700 bg-primary-50 border-primary-100 hover:bg-primary-100"
                >
                  View Reward History
                </Link>
              </div>

              {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          {/* {transaction.isManual && (
                            <p className="inline-flex items-center px-2 py-1 mt-2 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                              Manual admin commission{transaction.adminName ? ` by ${transaction.adminName}` : ''}
                            </p>
                          )} */}
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-700">
                            +{transaction.amount.toLocaleString()} ETB
                          </p>
                          <p className="text-xs text-gray-500 uppercase">
                            {transaction.type === 'deposit'
                              ? 'Deposit'
                              : 'Commission'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No transactions yet</p>
                  <p className="mt-1 text-sm text-gray-400">
                    Make your first deposit to start earning
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upline Payment Modal */}
        {showUplinePaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Submit Upline Credit Payment</h3>
                <button
                  onClick={() => setShowUplinePaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Credit Amount */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Credit Amount (ETB) *
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Pending amount: {(stats?.pendingUplineCredit || 0).toLocaleString()} ETB
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Payment Account *
                  </label>
                  <select
                    value={selectedMerchantAccountId}
                    onChange={(e) => {
                      setSelectedMerchantAccountId(e.target.value);
                      const selected = merchantAccounts.find(acc => acc._id === e.target.value);
                      if (selected) setPaymentMethod(selected.type);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {merchantAccounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.name} - {account.accountNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Account Details */}
                {selectedMerchantAccountId && merchantAccounts.find(a => a._id === selectedMerchantAccountId) && (
                  <div className="p-4 border border-emerald-200 rounded-lg bg-emerald-50">
                    {(() => {
                      const account = merchantAccounts.find(a => a._id === selectedMerchantAccountId);
                      return (
                        <div className="space-y-2 text-sm">
                          <div><span className="font-semibold text-gray-700">Account Name:</span> {account?.accountName}</div>
                          <div><span className="font-semibold text-gray-700">Account Number:</span> {account?.accountNumber}</div>
                          {account?.bankName && <div><span className="font-semibold text-gray-700">Bank:</span> {account.bankName}</div>}
                          {account?.instructions && <div><span className="font-semibold text-gray-700">Instructions:</span> {account.instructions}</div>}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Transaction Reference */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Transaction Reference *
                  </label>
                  <input
                    type="text"
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Enter transaction reference / receipt number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Must match your bank/transfer reference
                  </p>
                </div>

                {/* Receipt Upload */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Upload Receipt Image *
                  </label>
                  <div className="p-6 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-500 hover:bg-primary-50">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label htmlFor="receipt-upload" className="cursor-pointer">
                      <div className="font-medium text-primary-600">
                        {receiptFile ? receiptFile.name : 'Click to upload or drag and drop'}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, GIF or PDF (Max 10MB)
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowUplinePaymentModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitUplinePayment}
                  disabled={submittingPayment}
                  className="flex-1 px-4 py-2 text-white border border-transparent rounded-md bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingPayment ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
