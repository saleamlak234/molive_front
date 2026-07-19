import React, { useState, useEffect } from 'react';
import FilePreviewModal from '../components/ImagePreviewModal';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  User
} from 'lucide-react';
import axios from 'axios';
import env from '../config/env';

interface ReferralDeposit {
  _id: string;
  amount: number;
  package: string;
  paymentMethod: 'bank_transfer' | 'mobile_money';
  merchantAccount: {
    _id: string;
    name: string;
    type: string;
    accountNumber: string;
    accountName: string;
    bankName?: string;
    phoneNumber?: string;
    instructions: string;
  };
  status: 'pending' | 'completed' | 'rejected';
  receiptUrl?: string;
  transactionReference?: string;
  user: {
    _id: string;
    fullName: string;
    level: number;
  };
  processedBy?: {
    _id: string;
    fullName: string;
  };
  processedAt?: string;
  createdAt: string;
}

export default function ReferralApprovals() {
  const [deposits, setDeposits] = useState<ReferralDeposit[]>([]);
  const [historyDeposits, setHistoryDeposits] = useState<ReferralDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [pendingTypeFilter, setPendingTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    fetchReferralDeposits();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  const fetchReferralDeposits = async () => {
    setLoading(true);
    try {
      const [pendingResponse, historyResponse] = await Promise.all([
        axios.get('/user/referral-deposits'),
        axios.get('/user/referral-deposits/history'),
      ]);

      setDeposits(pendingResponse.data.deposits || []);
      setHistoryDeposits(historyResponse.data.deposits || []);
    } catch (error) {
      console.error('Error fetching referral deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPendingDeposits = deposits.filter((deposit: ReferralDeposit) => {
    const searchValue = pendingSearchTerm.toLowerCase();
    const matchesSearch =
      deposit.user.fullName.toLowerCase().includes(searchValue) ||
      (deposit.transactionReference || '').toLowerCase().includes(searchValue) ||
      deposit.package.toLowerCase().includes(searchValue);

    const depositType = deposit.package === 'Credit Payment' ? 'credit_payment' : 'deposit';
    const matchesType = pendingTypeFilter === 'all' || depositType === pendingTypeFilter;

    return matchesSearch && matchesType;
  });

  const filteredHistoryDeposits = historyDeposits.filter((deposit: ReferralDeposit) => {
    const searchValue = searchTerm.toLowerCase();
    const matchesSearch =
      deposit.user.fullName.toLowerCase().includes(searchValue) ||
      (deposit.transactionReference || '').toLowerCase().includes(searchValue) ||
      deposit.package.toLowerCase().includes(searchValue);

    const depositType = deposit.package === 'Credit Payment' ? 'credit_payment' : 'deposit';
    const matchesType = typeFilter === 'all' || depositType === typeFilter;
    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const resetPendingFilters = () => {
    setPendingSearchTerm('');
    setPendingTypeFilter('all');
  };

  const resetHistoryFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const handleApproval = async (depositId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    setProcessing(depositId);
    try {
      await axios.post(`/user/referral-deposits/${depositId}`, {
        action,
        rejectionReason
      });
      // Refresh the list
      await fetchReferralDeposits();
    } catch (error) {
      console.error('Error processing deposit:', error);
      alert('Error processing deposit');
    } finally {
      setProcessing(null);
    }
  };

  const viewReceipt = (receiptUrl: string) => {
    const baseURL = env.API_BASE_URL
    const fullReceiptUrl = `${baseURL}${receiptUrl}`;
    setSelectedImage(fullReceiptUrl);
    setShowImageModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Referral Deposit & Credit Approvals</h1>
        <p className="mt-2 text-gray-600">Review and approve deposit and credit payment requests from your direct referrals</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Pending Approvals</h2>
          <p className="mt-1 text-sm text-gray-500">Approve or reject pending deposit or credit payment requests from your direct referrals.</p>
        </div>

        <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute w-5 h-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={pendingSearchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPendingSearchTerm(e.target.value)}
                placeholder="Search pending by child name, package, or reference..."
                className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row md:items-center">
              <select
                value={pendingTypeFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPendingTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="credit_payment">Credit Payments</option>
              </select>
              <button
                type="button"
                onClick={resetPendingFilters}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200"
              >
                Reset Filters
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredPendingDeposits.length} of {deposits.length} pending records
          </div>
        </div>

        {filteredPendingDeposits.length === 0 ? (
          <div className="py-12 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
            <User className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {deposits.length === 0 ? 'No pending deposits' : 'No pending requests match your filters'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {deposits.length === 0
                ? 'There are no initial deposits waiting for your approval.'
                : 'Try clearing the search or changing the type filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Child</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Package</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Receipt</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPendingDeposits.map((deposit) => (
                  <tr key={deposit._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{deposit.user.fullName}</div>
                      <div className="text-sm text-gray-500">Level {deposit.user.level}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{deposit.package}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{deposit.amount.toLocaleString()} ETB</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {deposit.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Mobile Money'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{deposit.transactionReference || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {deposit.receiptUrl ? (
                        <button
                          onClick={() => viewReceipt(deposit.receiptUrl!)}
                          className="font-medium text-primary-600 hover:text-primary-800"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 space-x-2 text-sm font-medium text-right whitespace-nowrap">
                      <button
                        onClick={() => handleApproval(deposit._id, 'approve')}
                        disabled={processing === deposit._id}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {processing === deposit._id ? (
                          <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Rejection reason:');
                          if (reason) handleApproval(deposit._id, 'reject', reason);
                        }}
                        disabled={processing === deposit._id}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Approval History</h2>
            <p className="mt-1 text-sm text-gray-500">View completed and rejected child deposits and credit approvals after your decisions.</p>
          </div>

          <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute w-5 h-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  placeholder="Search by child name, package, or reference..."
                  className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row md:items-center">
                <select
                  value={typeFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="credit_payment">Credit Payments</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  type="button"
                  onClick={resetHistoryFilters}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200"
                >
                  Reset Filters
                </button>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredHistoryDeposits.length} of {historyDeposits.length} history records
            </div>
          </div>

          {filteredHistoryDeposits.length === 0 ? (
            <div className="py-12 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
              <Clock className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {historyDeposits.length === 0 ? 'No history yet' : 'No records match the current filter'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {historyDeposits.length === 0
                  ? 'Approved or rejected referral deposits will appear here.'
                  : 'Try changing the search or filters to find history records.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Child</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Package</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Processed By</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Processed At</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Reference</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Receipt</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHistoryDeposits.map((deposit) => (
                    <tr key={deposit._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{deposit.user.fullName}</div>
                        <div className="text-sm text-gray-500">Level {deposit.user.level}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{deposit.package}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{deposit.amount.toLocaleString()} ETB</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">{getStatusBadge(deposit.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{deposit.processedBy?.fullName || 'You'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {deposit.processedAt ? new Date(deposit.processedAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{deposit.transactionReference || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {deposit.receiptUrl ? (
                          <button
                            onClick={() => viewReceipt(deposit.receiptUrl!)}
                            className="font-medium text-primary-600 hover:text-primary-800"
                          >
                            View
                          </button>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <FilePreviewModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        fileUrl={selectedImage}
        title="Payment Receipt"
        allowDownload={true}
      />
    </div>
  );
}