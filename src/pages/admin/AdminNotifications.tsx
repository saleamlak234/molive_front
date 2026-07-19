import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Edit, Trash2, PlusCircle, Eye } from 'lucide-react';
import axios from 'axios';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: string;
  createdBy?: {
    fullName: string;
    email: string;
  };
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ title: '', message: '', isActive: true });
  const [editingNotification, setEditingNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingNotification(null);
    setFormData({ title: '', message: '', isActive: true });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.message.trim()) {
      setError('Please enter both title and message.');
      return;
    }

    setSaving(true);
    try {
      if (editingNotification) {
        await axios.put(`/admin/notifications/${editingNotification._id}`, {
          title: formData.title,
          message: formData.message,
          isActive: formData.isActive,
        });
        setSuccess('Notification updated successfully.');
      } else {
        await axios.post('/admin/notifications', {
          title: formData.title,
          message: formData.message,
        });
        setSuccess('Notification created successfully.');
      }
      resetForm();
      fetchNotifications();
    } catch (error: any) {
      console.error('Save notification error:', error);
      setError(error.response?.data?.message || 'Unable to save notification.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (notification: NotificationItem) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      isActive: notification.isActive,
    });
    setError('');
    setSuccess('');
  };

  const handleDelete = async (notificationId: string) => {
    if (!window.confirm('Delete this notification?')) {
      return;
    }

    try {
      await axios.delete(`/admin/notifications/${notificationId}`);
      setSuccess('Notification deleted successfully.');
      fetchNotifications();
    } catch (error: any) {
      console.error('Delete notification error:', error);
      setError(error.response?.data?.message || 'Unable to delete notification.');
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notification Manager</h1>
          <p className="mt-2 text-gray-600">Create, edit, and remove banner messages that display across the site.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create / Edit Notification</h2>
                <p className="mt-1 text-sm text-gray-500">Submit site-wide notification banner text to show for active notifications.</p>
              </div>
              <div className="inline-flex items-center px-3 py-2 text-sm font-semibold text-white rounded-full bg-emerald-600">
                <PlusCircle className="w-4 h-4 mr-2" />
                {editingNotification ? 'Edit Mode' : 'New Notification'}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Banner Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter notification title"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Banner Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter notification message"
                  rows={5}
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  Active
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : editingNotification ? 'Update Notification' : 'Create Notification'}
                  </button>
                </div>
              </div>

              {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-xl">{error}</div>}
              {success && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-xl">{success}</div>}
            </form>
          </section>

          <section className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                <p className="mt-1 text-sm text-gray-500">All stored notification banners from the database.</p>
              </div>
              <Link to="/admin" className="text-sm font-medium text-emerald-600 hover:text-emerald-800">
                Back to dashboard
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No notifications created yet.</div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification._id} className="p-4 border border-gray-200 rounded-3xl bg-gray-50">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                        <p className="mt-2 text-sm text-gray-600">{notification.message}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${notification.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                          {notification.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(notification)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(notification._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
