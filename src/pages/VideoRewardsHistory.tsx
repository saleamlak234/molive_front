import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, ChevronLeft } from 'lucide-react';

interface RewardHistoryItem {
    _id: string;
    amount: number;
    type: 'dailyReturn' | 'dailyReferral' | string;
    description: string;
    createdAt: string;
    fromUser?: {
        _id: string;
        fullName: string;
    };
}

export default function VideoRewardsHistory() {
    const [history, setHistory] = useState<RewardHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get('/videos/rewards/history');
                setHistory(response.data.rewards || []);
            } catch (err) {
                console.error('Error fetching reward history:', err);
                setError('Unable to load reward history at this time.');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen py-8 bg-gray-50">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Video Reward History</h1>
                        <p className="mt-1 text-gray-600">
                            See your credited midnight video returns and referral reward history.
                        </p>
                    </div>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Link>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Midnight reward entries</h2>
                                <p className="text-sm text-gray-500">
                                    This list shows daily video earnings and daily referral commissions that were posted at midnight.
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">
                                Total items: {history.length}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block w-12 h-12 border-4 border-gray-200 rounded-full border-t-primary-600 animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-600">{error}</div>
                    ) : history.length === 0 ? (
                        <div className="p-8 text-center text-gray-600">
                            <Clock className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                            No reward history found yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                            Source
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                            Description
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {history.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(item.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                                {item.type === 'dailyReturn' ? 'Daily Reward' : item.type === 'dailyReferral' ? 'Referral Reward' : item.type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">
                                                +{item.amount.toLocaleString()} ETB
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {item.type === 'dailyReferral'
                                                    ? item.fromUser?.fullName || 'Upline'
                                                    : 'Self'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {item.description}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
