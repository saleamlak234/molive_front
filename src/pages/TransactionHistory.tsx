import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getTranslation } from '../utils/translations';

interface TransactionItem {
    _id: string;
    type: 'commission' | 'credit_forward' | 'credit_payment' | 'deposit' | 'balance_adjustment';
    direction: 'credit' | 'debit';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
    relatedUser?: {
        fullName: string;
        email: string;
    } | null;
}

export default function TransactionHistory() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [language, setLanguage] = useState<string>(user?.preferredLanguage || 'am');
    const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const t = (key: string) => getTranslation(key, language);

    useEffect(() => {
        if (user?.preferredLanguage) {
            setLanguage(user.preferredLanguage);
        }
    }, [user]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('/transactions/history', {
                    params: { period: selectedPeriod }
                });
                setTransactions(response.data.transactions || []);
            } catch (err: any) {
                setError(err.response?.data?.message || t('unableLoadTransactionHistory'));
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchTransactions();
        }
    }, [user, selectedPeriod]);

    const formatAmount = (amount: number) =>
        amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const visibleTransactions = transactions.filter((tx) => tx.type !== 'credit_payment');

    const typeLabel = (type: TransactionItem['type']) => {
        const typeMap: { [key: string]: string } = {
            'commission': t('commissionEarned'),
            'credit_forward': t('creditForwarded'),
            'credit_payment': t('creditPayment'),
            'deposit': t('deposit'),
            'balance_adjustment': t('balanceAdjustment'),
        };
        return typeMap[type] || t('transaction');
    };

    return (
        <div className="min-h-screen py-8 bg-gray-50">
            <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
                <div className="flex flex-col gap-2 mb-8 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t('creditTransactionHistory')}</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            {t('reviewCreditPayments')}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <label htmlFor="language" className="text-sm font-medium text-gray-700">
                            {t('languageLabel')}:
                        </label>
                        <select
                            id="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 focus:border-primary-500 focus:ring-primary-500"
                        >
                            <option value="am">አማርኛ</option>
                            <option value="or">Oromoo</option>
                            <option value="ti">ትግርኛ</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{t('summaryFor')}:</span>
                        <div className="inline-flex rounded-xl bg-white border border-gray-200 shadow-sm">
                            {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                                <button
                                    key={period}
                                    type="button"
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`px-4 py-2 text-sm font-semibold transition ${selectedPeriod === period ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {t(period)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">{t(selectedPeriod)}</p>
                </div>

                <div className="grid gap-4 mb-6 sm:grid-cols-3">
                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase">{t('totalCreditSent')}</h2>
                        <p className="mt-3 text-3xl font-semibold text-gray-900">
                            {formatAmount(
                                transactions
                                    .filter((tx) => tx.type === 'credit_forward')
                                    .reduce((sum, tx) => sum + tx.amount, 0),
                            )} {t('birr')}
                        </p>
                    </div>
                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase">{t('totalCreditPaid')}</h2>
                        <p className="mt-3 text-3xl font-semibold text-gray-900">
                            {formatAmount(
                                transactions
                                    .filter((tx) => tx.type === 'credit_payment')
                                    .reduce((sum, tx) => sum + tx.amount, 0),
                            )} {t('birr')}
                        </p>
                    </div>
                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase">{t('balanceChange')}</h2>
                        <p className="mt-3 text-3xl font-semibold text-gray-900">
                            {formatAmount(
                                transactions.length > 0
                                    ? transactions[0].balanceAfter - transactions[0].balanceBefore
                                    : 0,
                            )} {t('birr')}
                        </p>
                    </div>
                </div>

                {transactions.length > 0 && (
                    <>
                        <div className="grid gap-4 mb-6 sm:grid-cols-2">
                            <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase">{t('creditForwarded')}</h3>
                                <p className="mt-4 text-3xl font-bold text-yellow-700">
                                    {formatAmount(
                                        transactions
                                            .filter((tx) => tx.type === 'credit_forward')
                                            .reduce((sum, tx) => sum + tx.amount, 0)
                                    )}
                                </p>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase">{t('creditReceived')}</h3>
                                <p className="mt-4 text-3xl font-bold text-yellow-700">
                                    {formatAmount(
                                        transactions
                                            .filter((tx) => tx.type === 'deposit')
                                            .reduce((sum, tx) => sum + tx.amount, 0)
                                    )}
                                </p>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase">{t('totalWithdrawal')}</h3>
                                <p className="mt-4 text-3xl font-bold text-yellow-700">
                                    {formatAmount(
                                        transactions
                                            .filter((tx) => tx.direction === 'debit')
                                            .reduce((sum, tx) => sum + tx.amount, 0)
                                    )}
                                </p>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase">{t('commissionCredit')}</h3>
                                <p className="mt-4 text-3xl font-bold text-yellow-700">
                                    {formatAmount(
                                        transactions
                                            .filter((tx) => tx.type === 'commission')
                                            .reduce((sum, tx) => sum + tx.amount, 0)
                                    )}
                                </p>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase">{t('creditPayment')}</h3>
                                <p className="mt-4 text-3xl font-bold text-yellow-700">
                                    {formatAmount(
                                        transactions
                                            .filter((tx) => tx.type === 'credit_payment')
                                            .reduce((sum, tx) => sum + tx.amount, 0)
                                    )}
                                </p>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase">{t('lockedCredit')}</h3>
                                <p className="mt-4 text-3xl font-bold text-yellow-700">0</p>
                            </div>
                        </div>
                    </>
                )}

                <div className="overflow-hidden bg-white rounded-xl shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900">{t('recentTransactions')}</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">{t('date')}</th>
                                    <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">{t('type')}</th>
                                    <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">{t('direction')}</th>
                                    <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">{t('amount')}</th>
                                    <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">{t('balanceBefore')}</th>
                                    <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">{t('balanceAfter')}</th>
                                    <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">{t('details')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                            {t('loadingTransactionHistory')}
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-red-600">
                                            {error}
                                        </td>
                                    </tr>
                                ) : visibleTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <p>{t('noTransactionsFound')}</p>
                                                <p className="text-sm">{t('makeFirstDeposit')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    visibleTransactions.map((transaction) => (
                                        <tr key={transaction._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(transaction.createdAt).toLocaleDateString(language === 'am' ? 'am-ET' : language === 'ti' ? 'ti-ER' : language === 'or' ? 'or-ET' : 'en-US')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {typeLabel(transaction.type)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${transaction.direction === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {transaction.direction === 'credit' ? (
                                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <ArrowDownRight className="w-3.5 h-3.5" />
                                                    )}
                                                    {transaction.direction === 'credit' ? t('credit') : t('debit')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                {formatAmount(transaction.amount)} {t('birr')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatAmount(transaction.balanceBefore)} {t('birr')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatAmount(transaction.balanceAfter)} {t('birr')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {transaction.description}
                                                {transaction.relatedUser && (
                                                    <div className="mt-1 text-xs text-gray-400">
                                                        Related: {transaction.relatedUser.fullName}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
