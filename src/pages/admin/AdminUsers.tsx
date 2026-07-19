import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Eye,
  DollarSign,
  X,
  TrendingUp,
  Award,
  Trash2
} from 'lucide-react';
import axios from 'axios';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  role: 'user' | 'admin' | 'transaction_admin' | 'super_admin';
  totalDeposits: number;
  totalCommissions: number;
  balance: number;
  totalPaid?: number;
  directReferrals: number;
  totalTeamSize: number;
  level: number;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  lastLoginAt?: string;
  pendingUplineCredit?: number;
}

interface RewardHistoryItem {
  _id: string;
  amount: number;
  type: 'dailyReturn' | 'dailyReferral' | 'directReferral' | 'deposit' | 'upgrade' | 'credit' | 'earning' | string;
  description: string;
  createdAt: string;
  fromUser?: {
    _id: string;
    fullName: string;
  };
  failureReason?: string | null;
}

interface ManualCommissionForm {
  type: string;
  amount: string;
  level: string;
  sourceUserId: string;
  description: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditFinancial, setShowEditFinancial] = useState(false);
  const [financialForm, setFinancialForm] = useState({
    fieldChanged: 'balance' as 'balance' | 'totalCommissions' | 'totalDeposits',
    action: 'set' as 'set' | 'add' | 'subtract',
    value: '',
    reason: '',
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [rewardHistory, setRewardHistory] = useState<RewardHistoryItem[]>([]);
  const [rewardHistoryLoading, setRewardHistoryLoading] = useState(false);
  const [rewardHistoryError, setRewardHistoryError] = useState('');
  const [showRewardModal, setShowRewardModal] = useState(false);

  const commissionTypeLabels: Record<string, string> = {
    dailyReturn: 'Daily Return',
    dailyReferral: 'Daily Referral',
    directReferral: 'Direct Referral',
    deposit: 'Deposit',
    upgrade: 'Upgrade',
    credit: 'Credit',
    earning: 'Earning',
  };

  const commissionTypeOrder = [
    'dailyReturn',
    'dailyReferral',
    'directReferral',
    'deposit',
    'upgrade',
    'credit',
    'earning',
  ];

  const groupedRewardHistory = useMemo(() => {
    return rewardHistory.reduce((acc, entry) => {
      const type = entry.type || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(entry);
      return acc;
    }, {} as Record<string, RewardHistoryItem[]>);
  }, [rewardHistory]);
  const [manualCommissionForm, setManualCommissionForm] = useState<ManualCommissionForm>({
    type: 'dailyReturn',
    amount: '',
    level: '1',
    sourceUserId: '',
    description: '',
  });
  const [manualCommissionLoading, setManualCommissionLoading] = useState(false);
  const [downlineUsers, setDownlineUsers] = useState<{ _id: string; fullName: string }[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; userId: string | null; userName: string }>({
    show: false,
    userId: null,
    userName: ''
  });
  const [deleting, setDeleting] = useState(false);

  const { user: authUser } = useAuth();
  const canEditFinancial = authUser?.role === 'admin';
  const canManageCommissions = ['admin', 'super_admin'].includes(authUser?.role || '');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchRewardHistory(selectedUser._id);
    } else {
      setRewardHistory([]);
      setRewardHistoryError('');
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchDownlineUsers(selectedUser._id, Number(manualCommissionForm.level));
    } else {
      setDownlineUsers([]);
      setManualCommissionForm((prev) => ({ ...prev, sourceUserId: '' }));
    }
  }, [selectedUser, manualCommissionForm.level]);

  const fetchAuditLog = async (userId: string) => {
    try {
      const response = await axios.get(`/admin/users/${userId}/audit-log`);
      setAuditLog(response.data.auditLog);
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
    }
  };

  const fetchRewardHistory = async (userId: string) => {
    try {
      setRewardHistoryLoading(true);
      setRewardHistoryError('');
      const response = await axios.get(`/admin/users/${userId}/reward-history`);
      setRewardHistory(response.data.rewards || []);
    } catch (error) {
      console.error('Failed to fetch reward history:', error);
      setRewardHistoryError('Unable to load reward history at this time.');
    } finally {
      setRewardHistoryLoading(false);
    }
  };

  const fetchDownlineUsers = async (userId: string, level: number) => {
    try {
      const response = await axios.get(`/admin/users/${userId}/downline`, {
        params: { level },
      });
      setDownlineUsers(response.data.users || []);
      if (response.data.users?.length === 1) {
        setManualCommissionForm((prev: ManualCommissionForm) => ({
          ...prev,
          sourceUserId: response.data.users[0]._id,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch downline users:', error);
      setDownlineUsers([]);
      setManualCommissionForm((prev: ManualCommissionForm) => ({ ...prev, sourceUserId: '' }));
    }
  };

  const handleCreateManualCommission = async () => {
    if (!selectedUser) return;
    if (!manualCommissionForm.amount || !manualCommissionForm.type) {
      alert('Please complete the manual commission form.');
      return;
    }

    setManualCommissionLoading(true);
    try {
      const response = await axios.post(`/admin/users/${selectedUser._id}/commissions`, {
        type: manualCommissionForm.type,
        amount: Number(manualCommissionForm.amount),
        level: Number(manualCommissionForm.level),
        sourceUserId: manualCommissionForm.sourceUserId || null,
        description: manualCommissionForm.description || undefined,
      });

      if (response.data.commission) {
        const amount = Number(manualCommissionForm.amount);
        const updatedUser = {
          ...selectedUser,
          balance: selectedUser.balance + amount,
          totalCommissions: selectedUser.totalCommissions + amount,
        };
        setSelectedUser(updatedUser);
        setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
        setManualCommissionForm({ type: 'dailyReturn', amount: '', level: '1', sourceUserId: '', description: '' });
        setDownlineUsers([]);
        alert('Manual commission added successfully.');
      }
    } catch (error: any) {
      console.error('Failed to add manual commission:', error);
      alert(error?.response?.data?.message || 'Failed to add manual commission');
    } finally {
      setManualCommissionLoading(false);
    }
  };

  const handleEditFinancialClick = () => {
    setShowEditFinancial(true);
    if (selectedUser) {
      fetchAuditLog(selectedUser._id);
    }
  };

  const handleUpdateFinancial = async () => {
    if (!selectedUser || !financialForm.value || !financialForm.reason) {
      alert('Please fill in all fields');
      return;
    }

    setUpdateLoading(true);
    try {
      const response = await axios.put(`/admin/users/${selectedUser._id}/financial`, {
        fieldChanged: financialForm.fieldChanged,
        newValue: Number(financialForm.value),
        action: financialForm.action,
        reason: financialForm.reason,
      });

      if (response.data.user) {
        // Update selected user
        setSelectedUser(response.data.user);
        // Update users list
        setUsers(users.map(u => u._id === selectedUser._id ? response.data.user : u));
        // Refresh audit log
        await fetchAuditLog(selectedUser._id);
        setFinancialForm({
          fieldChanged: 'balance',
          action: 'set',
          value: '',
          reason: '',
        });
        setShowEditFinancial(false);
        alert('Financial information updated successfully');
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to update financial information');
      console.error('Update financial error:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await axios.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(users.map(user =>
        user._id === userId ? { ...user, isActive: !currentStatus } : user
      ));
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeleteConfirm({
      show: true,
      userId: user._id,
      userName: user.fullName
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.userId) return;

    setDeleting(true);
    try {
      await axios.delete(`/admin/users/${deleteConfirm.userId}`);
      // Refetch users from database to keep list in sync
      await fetchUsers();
      setDeleteConfirm({ show: false, userId: null, userName: '' });
      alert('User deleted successfully. Parent network counts have been updated.');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Error deleting user');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesStatus;
  });

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-gray-600">Manage user accounts and monitor activity</p>
        </div>

        {/* Filters */}
        <div className="p-6 mb-8 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-2 pl-10 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Deposits
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Upline Pending
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Network
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 mr-3 rounded-full bg-primary-100">
                          <Users className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName}
                            {user.role === 'admin' && (
                              <span className="px-2 py-1 ml-2 text-xs rounded-full bg-gold-100 text-gold-800">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">{user.phoneNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.balance.toLocaleString()} ETB
                      </div>
                      <div className="text-xs text-gray-500">
                        Commissions: {user.totalCommissions.toLocaleString()} ETB
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.totalDeposits.toLocaleString()} ETB
                      </div>
                      <div className="text-xs text-gray-500">
                        Commission: {user.totalCommissions.toLocaleString()} ETB
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {(user.pendingUplineCredit || 0).toLocaleString()} ETB
                      </div>
                      <div className={`text-xs font-semibold ${user.pendingUplineCredit && user.pendingUplineCredit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {user.pendingUplineCredit && user.pendingUplineCredit > 0 ? 'Has credit' : 'None'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Level {user.level}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.directReferrals} direct • {user.totalTeamSize} total
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusToggle(user._id, user.isActive)}
                          className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                            }`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl max-h-screen overflow-y-auto bg-white rounded-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="mb-3 font-semibold text-gray-900">Basic Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <p className="text-gray-900">{selectedUser.fullName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{selectedUser.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900">{selectedUser.phoneNumber}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Referral Code</label>
                        <p className="font-mono text-gray-900">{selectedUser.referralCode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Financial Summary</h3>
                      {canEditFinancial && (
                        <button
                          onClick={handleEditFinancialClick}
                          className="px-3 py-1 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Current Balance</p>
                          <p className="font-semibold text-gray-900">
                            {selectedUser.balance.toLocaleString()} ETB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="text-sm text-gray-600">Total Deposits</p>
                          <p className="font-semibold text-gray-900">
                            {selectedUser.totalDeposits.toLocaleString()} ETB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Award className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-600">Total Commissions</p>
                          <p className="font-semibold text-gray-900">
                            {selectedUser.totalCommissions.toLocaleString()} ETB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Award className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-600">Total Paid Balances</p>
                          <p className="font-semibold text-gray-900">
                            {Number(selectedUser.totalPaid || 0).toLocaleString()} ETB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Network Info */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="mb-3 font-semibold text-gray-900">Network Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-gray-600">Level</p>
                        <p className="font-semibold text-gray-900">Level {selectedUser.level}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Direct Referrals</p>
                        <p className="font-semibold text-gray-900">{selectedUser.directReferrals}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Team Size</p>
                        <p className="font-semibold text-gray-900">{selectedUser.totalTeamSize}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="mb-3 font-semibold text-gray-900">Account Status</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedUser.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {selectedUser.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(selectedUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reward History */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Reward History</h3>
                        <p className="text-sm text-gray-500">
                          Recent daily reward and referral reward activity for this user.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => selectedUser && fetchRewardHistory(selectedUser._id)}
                          className="px-3 py-2 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700"
                        >
                          Refresh
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRewardModal(true)}
                          className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          View all
                        </button>
                      </div>
                    </div>

                    {rewardHistoryLoading ? (
                      <div className="p-6 text-center">
                        <div className="inline-block w-10 h-10 border-4 border-gray-200 rounded-full border-t-primary-600 animate-spin"></div>
                      </div>
                    ) : rewardHistoryError ? (
                      <div className="p-4 text-sm text-red-600">{rewardHistoryError}</div>
                    ) : rewardHistory.length === 0 ? (
                      <div className="p-4 text-sm text-gray-600">
                        No reward history available for this user.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left divide-y divide-gray-200">
                          <thead className="bg-white">
                            <tr>
                              <th className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                Date
                              </th>
                              <th className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                Type
                              </th>
                              <th className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                Amount
                              </th>
                              <th className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                Source
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {rewardHistory.slice(0, 5).map((entry) => (
                              <tr key={entry._id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">
                                  {new Date(entry.createdAt).toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">
                                  {commissionTypeLabels[entry.type] || entry.type}
                                </td>
                                <td className="px-3 py-2 text-sm text-green-700 whitespace-nowrap">
                                  {entry.amount >= 0 ? '+' : ''}{entry.amount.toLocaleString()} ETB
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">
                                  {entry.fromUser?.fullName || 'System'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {rewardHistory.length > 5 && (
                          <p className="mt-3 text-xs text-gray-500">Showing latest 5 records. Click View all to see the full history.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {canManageCommissions && (
                    <div className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">Add Manual Commission</h3>
                          <p className="text-sm text-gray-500">
                            Record a missed commission for the user and credit their balance immediately.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Commission Type *</label>
                          <select
                            value={manualCommissionForm.type}
                            onChange={(e) => setManualCommissionForm({ ...manualCommissionForm, type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="deposit">Deposit</option>
                            <option value="earning">Earning</option>
                            <option value="dailyReturn">Daily Return</option>
                            <option value="dailyReferral">Daily Referral</option>
                            <option value="directReferral">Direct Referral</option>
                            <option value="credit">Credit</option>
                          </select>
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Amount (ETB) *</label>
                          <input
                            type="number"
                            step="0.01"
                            value={manualCommissionForm.amount}
                            onChange={(e) => setManualCommissionForm({ ...manualCommissionForm, amount: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Level *</label>
                          <select
                            value={manualCommissionForm.level}
                            onChange={(e) => {
                              const nextLevel = e.target.value;
                              setManualCommissionForm({ ...manualCommissionForm, level: nextLevel, sourceUserId: '' });
                              if (selectedUser) {
                                fetchDownlineUsers(selectedUser._id, Number(nextLevel));
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="1">Level 1</option>
                            <option value="2">Level 2</option>
                            <option value="3">Level 3</option>
                          </select>
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Source User (Level selection)</label>
                          <select
                            value={manualCommissionForm.sourceUserId}
                            onChange={(e) => setManualCommissionForm({ ...manualCommissionForm, sourceUserId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="">Select source user</option>
                            {downlineUsers.map((downline) => (
                              <option key={downline._id} value={downline._id}>
                                {downline.fullName}
                              </option>
                            ))}
                          </select>
                          <p className="mt-2 text-xs text-gray-500">
                            Pick the downline user for the selected level, so the commission record shows their name in the description.
                          </p>
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Reason / Description</label>
                          <textarea
                            rows={3}
                            value={manualCommissionForm.description}
                            onChange={(e) => setManualCommissionForm({ ...manualCommissionForm, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end mt-4">
                        <button
                          onClick={handleCreateManualCommission}
                          disabled={manualCommissionLoading}
                          className="inline-flex items-center justify-center px-4 py-2 font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {manualCommissionLoading ? 'Saving...' : 'Save Manual Commission'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleStatusToggle(selectedUser._id, selectedUser.isActive)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium ${selectedUser.isActive
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                      {selectedUser.isActive ? 'Deactivate User' : 'Activate User'}
                    </button>
                    <button
                      onClick={() => setShowUserModal(false)}
                      className="flex-1 px-4 py-2 font-medium text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reward History Modal */}
        {showRewardModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-4xl max-h-screen overflow-hidden bg-white rounded-xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Full Commission History</h2>
                  <p className="text-sm text-gray-500">All commission records for {selectedUser.fullName}, grouped by type.</p>
                </div>
                <button
                  onClick={() => setShowRewardModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="h-[80vh] overflow-y-auto p-6">
                {rewardHistoryLoading ? (
                  <div className="p-6 text-center">
                    <div className="inline-block w-10 h-10 border-4 border-gray-200 rounded-full border-t-primary-600 animate-spin"></div>
                  </div>
                ) : rewardHistoryError ? (
                  <div className="p-4 text-sm text-red-600">{rewardHistoryError}</div>
                ) : rewardHistory.length === 0 ? (
                  <div className="p-4 text-sm text-gray-600">No commission history available for this user.</div>
                ) : (
                  <div className="space-y-6">
                    {commissionTypeOrder.map((type) => {
                      const entries = groupedRewardHistory[type] || [];
                      if (!entries.length) return null;
                      return (
                        <div key={type}>
                          <h3 className="mb-3 text-lg font-semibold text-gray-900">
                            {commissionTypeLabels[type] || type} ({entries.length})
                          </h3>
                          <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full text-left divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Date</th>
                                  <th className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Amount</th>
                                  <th className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Source</th>
                                  <th className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Description</th>
                                  <th className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Status</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {entries.map((entry) => (
                                  <tr key={entry._id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{new Date(entry.createdAt).toLocaleString()}</td>
                                    <td className="px-3 py-2 text-sm text-green-700 whitespace-nowrap">{entry.amount >= 0 ? '+' : ''}{entry.amount.toLocaleString()} ETB</td>
                                    <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{entry.fromUser?.fullName || 'System'}</td>
                                    <td className="px-3 py-2 text-sm text-gray-600">{entry.description}</td>
                                    <td className="px-3 py-2 text-sm">
                                      {entry.failureReason ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 cursor-help" title={entry.failureReason}>
                                          ❌ Failed
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          ✓ Credited
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                    {Object.keys(groupedRewardHistory).filter((type) => !commissionTypeOrder.includes(type)).map((type) => (
                      <div key={type}>
                        <h3 className="mb-3 text-lg font-semibold text-gray-900">{type} ({groupedRewardHistory[type].length})</h3>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                          <table className="min-w-full text-left divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Date</th>
                                <th className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Amount</th>
                                <th className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Source</th>
                                <th className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Description</th>
                                <th className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {groupedRewardHistory[type].map((entry) => (
                                <tr key={entry._id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{new Date(entry.createdAt).toLocaleString()}</td>
                                  <td className="px-3 py-2 text-sm text-green-700 whitespace-nowrap">{entry.amount >= 0 ? '+' : ''}{entry.amount.toLocaleString()} ETB</td>
                                  <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{entry.fromUser?.fullName || 'System'}</td>
                                  <td className="px-3 py-2 text-sm text-gray-600">{entry.description}</td>
                                  <td className="px-3 py-2 text-sm">
                                    {entry.failureReason ? (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" title={entry.failureReason}>
                                        Failed: {entry.failureReason.substring(0, 30)}{entry.failureReason.length > 30 ? '...' : ''}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Credited
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Financial Modal */}
        {showEditFinancial && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl max-h-screen overflow-y-auto bg-white rounded-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Financial Information</h2>
                  <button
                    onClick={() => setShowEditFinancial(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-emerald-50">
                    <p className="text-sm text-emerald-800">
                      <strong>User:</strong> {selectedUser.fullName} ({selectedUser.email})
                    </p>
                  </div>

                  {/* Field Selection */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Field to Update *
                    </label>
                    <select
                      value={financialForm.fieldChanged}
                      onChange={(e) => setFinancialForm({ ...financialForm, fieldChanged: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="balance">Current Balance</option>
                      <option value="totalCommissions">Total Commissions</option>
                      <option value="totalDeposits">Total Deposits</option>
                    </select>
                  </div>

                  {/* Current Value Display */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600">Current {financialForm.fieldChanged}:</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Number(selectedUser[financialForm.fieldChanged as keyof User] || 0).toLocaleString()} ETB
                    </p>
                  </div>

                  {/* Action Type */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Action Type *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['set', 'add', 'subtract'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setFinancialForm({ ...financialForm, action: type })}
                          className={`py-2 px-3 rounded-lg font-medium text-sm transition ${financialForm.action === type
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                          {type === 'set' ? 'Set to' : type === 'add' ? 'Add' : 'Subtract'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Value Input */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Amount (ETB) *
                    </label>
                    <input
                      type="number"
                      value={financialForm.value}
                      onChange={(e) => setFinancialForm({ ...financialForm, value: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      {financialForm.action === 'set' && 'New value will be set to this amount'}
                      {financialForm.action === 'add' && `New value will be ${selectedUser[financialForm.fieldChanged as keyof User]} + ${financialForm.value || '0'} = ${(Number(selectedUser[financialForm.fieldChanged as keyof User]) + Number(financialForm.value || 0)).toLocaleString()}`}
                      {financialForm.action === 'subtract' && `New value will be ${selectedUser[financialForm.fieldChanged as keyof User]} - ${financialForm.value || '0'} = ${Math.max(0, Number(selectedUser[financialForm.fieldChanged as keyof User]) - Number(financialForm.value || 0)).toLocaleString()}`}
                    </p>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Reason for Change * (for audit trail)
                    </label>
                    <textarea
                      value={financialForm.reason}
                      onChange={(e) => setFinancialForm({ ...financialForm, reason: e.target.value })}
                      placeholder="e.g., Manual correction for failed deposit, System error adjustment..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  {/* Recent Audit Log */}
                  {auditLog.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-gray-900">Recent Changes</h3>
                      <div className="space-y-2 overflow-y-auto max-h-32">
                        {auditLog.slice(0, 5).map((log: any) => (
                          <div key={log._id} className="p-2 text-xs border border-gray-200 rounded bg-gray-50">
                            <p className="font-medium text-gray-900">
                              {log.fieldChanged}: {log.oldValue} → {log.newValue} ({log.action})
                            </p>
                            <p className="text-gray-600">{log.reason}</p>
                            <p className="text-gray-400">
                              By {log.adminId?.fullName} • {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setShowEditFinancial(false)}
                    disabled={updateLoading}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateFinancial}
                    disabled={updateLoading}
                    className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {updateLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Financial Info'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white shadow-lg rounded-xl">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-center text-gray-900">Delete User</h3>
                <p className="mt-2 text-sm text-center text-gray-500">
                  Are you sure you want to delete <strong>{deleteConfirm.userName}</strong>?
                </p>
                <p className="mt-2 text-xs text-center text-red-600">
                  This action cannot be undone. The user, their deposits, and commission records will be deleted, and the user's downline will be reassigned to their upline. Parent network counts will be updated accordingly.
                </p>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setDeleteConfirm({ show: false, userId: null, userName: '' })}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete User
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}