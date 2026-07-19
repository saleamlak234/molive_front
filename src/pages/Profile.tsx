import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Users,
  TrendingUp,
  Edit3,
  Save,
  X,
  Shield,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || ''
  });
  const [merchantAccounts, setMerchantAccounts] = useState<any[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<any | null>(null);
  const [merchantForm, setMerchantForm] = useState({
    name: '',
    type: 'bank',
    accountNumber: '',
    bankName: '',
    phoneNumber: '',
    instructions: '',
  });
  const [merchantLoading, setMerchantLoading] = useState(false);
  const [merchantError, setMerchantError] = useState('');
  const [merchantSuccess, setMerchantSuccess] = useState('');
  const [merchantFieldErrors, setMerchantFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put('/user/profile', formData);
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      fullName: user?.fullName || '',
      phoneNumber: user?.phoneNumber || ''
    });
    setError('');
  };

  const fetchMerchantAccounts = async () => {
    try {
      const response = await axios.get('/user/merchant-accounts');
      setMerchantAccounts(response.data.merchantAccounts || []);
    } catch (err: any) {
      console.error('Failed to fetch merchant accounts:', err);
    }
  };

  useEffect(() => {
    fetchMerchantAccounts();
  }, []);

  const handleMerchantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMerchantForm(prev => ({ ...prev, [name]: value }));
    setMerchantError('');
    setMerchantSuccess('');
  };

  const startMerchantEdit = (account: any) => {
    setSelectedMerchant(account);
    setMerchantForm({
      name: account.name || '',
      type: account.type || 'bank',
      accountNumber: account.accountNumber || '',
      bankName: account.bankName || '',
      phoneNumber: account.phoneNumber || '',
      instructions: account.instructions || '',
    });
    setMerchantError('');
    setMerchantSuccess('');
  };

  const handleMerchantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchant) return;

    setMerchantLoading(true);
    setMerchantError('');
    setMerchantSuccess('');

    // Client-side validation before submit
    const fieldErrors: Record<string, string> = {};
    const normalizePhone = (p: string) => p.replace(/[^\d+]/g, '');
    const isValidPhoneNumber = (p: string) => /^\+?\d{8,15}$/.test(normalizePhone(p || ''));
    if (!merchantForm.name || !merchantForm.name.trim()) fieldErrors.name = 'Name is required';
    if (merchantForm.type === 'bank') {
      if (!merchantForm.accountNumber || !String(merchantForm.accountNumber).trim()) fieldErrors.accountNumber = 'Account number is required for bank accounts';
      if (!merchantForm.bankName || !merchantForm.bankName.trim()) fieldErrors.bankName = 'Bank name is required for bank accounts';
    } else {
      if (!merchantForm.phoneNumber || !String(merchantForm.phoneNumber).trim()) fieldErrors.phoneNumber = 'Phone number is required for mobile money';
      else if (!isValidPhoneNumber(merchantForm.phoneNumber)) fieldErrors.phoneNumber = 'Enter a valid phone number';
    }

    if (Object.keys(fieldErrors).length > 0) {
      setMerchantFieldErrors(fieldErrors);
      setMerchantError('Please correct the highlighted merchant fields.');
      setMerchantLoading(false);
      return;
    }
    setMerchantFieldErrors({});
    try {
      const payload: any = {
        name: merchantForm.name,
        type: merchantForm.type,
        accountName: merchantForm.type === 'bank' ? merchantForm.accountName : merchantForm.accountName,
        instructions: merchantForm.instructions,
      };

      if (merchantForm.type === 'bank') {
        payload.accountNumber = merchantForm.accountNumber;
        payload.bankName = merchantForm.bankName;
        payload.phoneNumber = undefined;
      } else {
        payload.phoneNumber = merchantForm.phoneNumber;
        payload.accountNumber = undefined;
        payload.bankName = undefined;
      }

      await axios.put(`/user/merchant-accounts/${selectedMerchant._id}`, payload);
      await fetchMerchantAccounts();
      setMerchantSuccess('Merchant account updated successfully.');
    } catch (err: any) {
      setMerchantError(err.response?.data?.message || 'Failed to update merchant account');
    } finally {
      setMerchantLoading(false);
    }
  };

  const clearMerchantSelection = () => {
    setSelectedMerchant(null);
    setMerchantForm({
      name: '',
      type: 'bank',
      accountNumber: '',
      bankName: '',
      phoneNumber: '',
      instructions: '',
    });
    setMerchantError('');
    setMerchantSuccess('');
  };

  const isMerchantFormValid = (() => {
    const m = merchantForm;
    if (!m.name || !m.name.trim()) return false;
    if (m.type === 'bank') {
      if (!m.accountNumber || !String(m.accountNumber).trim()) return false;
      if (!m.bankName || !m.bankName.trim()) return false;
    } else {
      if (!m.phoneNumber || !String(m.phoneNumber).trim()) return false;
    }
    return true;
  })();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-1 text-gray-600">Manage your account information and settings</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={cancelEdit}
                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {error && (
                  <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center p-3 mb-4 space-x-2 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50">
                    <CheckCircle className="w-4 h-4" />
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <User className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                      ) : (
                        <div className="flex items-center p-3 space-x-3 rounded-lg bg-gray-50">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{user.fullName}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <Phone className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                      ) : (
                        <div className="flex items-center p-3 space-x-3 rounded-lg bg-gray-50">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{user.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="flex items-center p-3 space-x-3 rounded-lg bg-gray-50">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{user.email}</span>
                      <span className="text-xs text-gray-500">(Cannot be changed)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Member Since
                    </label>
                    <div className="flex items-center p-3 space-x-3 rounded-lg bg-gray-50">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {isEditing && (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-primary-500" />
                    <span className="text-gray-900 capitalize">{user.role}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Level:</span>
                  <span className="text-gray-900">{user.level}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Deposits</p>
                    <p className="font-semibold text-gray-900">
                      {user.totalDeposits.toLocaleString()} ETB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Award className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Commissions</p>
                    <p className="font-semibold text-gray-900">
                      {user.totalCommissions.toLocaleString()} ETB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-full">
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Team Size</p>
                    <p className="font-semibold text-gray-900">
                      {user.totalTeamSize} members
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Merchant Accounts */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Merchant Accounts</h3>
                {selectedMerchant && (
                  <button
                    type="button"
                    onClick={clearMerchantSelection}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {merchantError && (
                <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                  {merchantError}
                </div>
              )}

              {merchantSuccess && (
                <div className="p-3 mb-4 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50">
                  {merchantSuccess}
                </div>
              )}

              {merchantAccounts.length === 0 ? (
                <p className="text-sm text-gray-600">No merchant accounts available.</p>
              ) : (
                <div className="mb-6 space-y-3">
                  {merchantAccounts.map((account) => (
                    <div key={account._id} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{account.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{account.type.replace('_', ' ')}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => startMerchantEdit(account)}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-gray-600">
                        {account.type === 'bank' ? (
                          <>
                            <p>Account number: {account.accountNumber}</p>
                            <p>Bank name: {account.bankName}</p>
                          </>
                        ) : (
                          <p>Phone number: {account.phoneNumber}</p>
                        )}
                        <p>Instructions: {account.instructions || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedMerchant && (
                <form onSubmit={handleMerchantSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={merchantForm.name}
                        onChange={handleMerchantChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                      {merchantFieldErrors.name && (
                        <p className="mt-2 text-sm text-red-600">{merchantFieldErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Type</label>
                      <select
                        name="type"
                        value={merchantForm.type}
                        onChange={handleMerchantChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="bank">Bank</option>
                        <option value="mobile_money">Mobile Money</option>
                      </select>
                    </div>

                    {merchantForm.type === 'bank' ? (
                      <>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Account Number</label>
                          <input
                            type="text"
                            name="accountNumber"
                            value={merchantForm.accountNumber}
                            onChange={handleMerchantChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${merchantFieldErrors.accountNumber ? 'border-red-500' : 'border-gray-300'}`}
                            required
                          />
                          {merchantFieldErrors.accountNumber && (
                            <p className="mt-2 text-sm text-red-600">{merchantFieldErrors.accountNumber}</p>
                          )}
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Bank Name</label>
                          <input
                            type="text"
                            name="bankName"
                            value={merchantForm.bankName}
                            onChange={handleMerchantChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${merchantFieldErrors.bankName ? 'border-red-500' : 'border-gray-300'}`}
                            required
                          />
                          {merchantFieldErrors.bankName && (
                            <p className="mt-2 text-sm text-red-600">{merchantFieldErrors.bankName}</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={merchantForm.phoneNumber}
                          onChange={handleMerchantChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${merchantFieldErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                          required
                        />
                        {merchantFieldErrors.phoneNumber && (
                          <p className="mt-2 text-sm text-red-600">{merchantFieldErrors.phoneNumber}</p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Instructions</label>
                      <textarea
                        name="instructions"
                        value={merchantForm.instructions}
                        onChange={handleMerchantChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={merchantLoading || !isMerchantFormValid}
                      className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {merchantLoading ? 'Saving...' : 'Save Merchant Account'}
                    </button>
                    <button
                      type="button"
                      onClick={clearMerchantSelection}
                      className="inline-flex items-center justify-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Referral Info */}
            <div className="p-6 border bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border-primary-200">
              <h3 className="mb-2 text-lg font-semibold text-primary-900">Referral Code</h3>
              <div className="p-3 mb-3 bg-white rounded-lg">
                <p className="font-mono text-lg font-bold text-center text-primary-600">
                  {user.referralCode}
                </p>
              </div>
              <p className="text-sm text-primary-700">
                Share this code to earn commissions from new members
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}