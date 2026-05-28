import { useState } from 'react';
import { useAuth } from '../../store/useAuth';
import api from '../../lib/api';

export default function ProfilePage() {
  const { user, updateProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', { fullName: fullName.trim(), phone: phone.trim() });
    } catch {
      // Backend unavailable — save locally
    }
    updateProfile({ fullName: fullName.trim(), phone: phone.trim() });
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setFullName(user.fullName);
    setPhone(user.phone || '');
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

        {/* Success toast */}
        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-center">
            <p className="text-green-700 text-sm font-medium">Profile updated!</p>
          </div>
        )}

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl mb-3">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <span>👤</span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{user.fullName}</h2>
          <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize mt-1">
            {user.role}
          </span>
        </div>

        {/* Profile form */}
        <div className="max-w-sm mx-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            {editing ? (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{user.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            {editing ? (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{user.phone || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-500">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-500 capitalize">{user.role}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member since</label>
            <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-500">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-4 space-y-3">
            {editing ? (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !fullName.trim()}
                  className="flex-1 bg-black text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-gray-800 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                Edit Profile
              </button>
            )}

            <button
              onClick={signOut}
              className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-medium hover:bg-red-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
