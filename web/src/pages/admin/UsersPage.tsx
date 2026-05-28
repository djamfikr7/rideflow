import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q))
      );
    }
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }
    setFiltered(result);
  }, [users, search, roleFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/users');
      const data = res.data.data || res.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700';
      case 'DRIVER':
        return 'bg-blue-100 text-blue-700';
      case 'RIDER':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Users</h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-accent"
        />

        {/* Role Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {['all', 'RIDER', 'DRIVER', 'ADMIN'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
                roleFilter === role
                  ? 'bg-accent text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {role === 'all' ? 'All' : role.charAt(0) + role.slice(1).toLowerCase() + 's'}
            </button>
          ))}
        </div>

        {/* User Count */}
        <p className="text-xs text-gray-500 mb-3">{filtered.length} users</p>

        {/* User List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <span className="text-4xl">👥</span>
            <p className="text-gray-500 mt-3">No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                className="w-full text-left bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 text-sm">{user.fullName}</p>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{user.email}</p>
                    {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                  </div>
                  <span className="text-xs text-gray-300">{formatDate(user.createdAt)}</span>
                </div>

                {/* Expanded Details */}
                {selectedUser?.id === user.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">User ID</span>
                      <span className="text-gray-700 font-mono">{user.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Created</span>
                      <span className="text-gray-700">{formatDate(user.createdAt)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Role</span>
                      <span className="text-gray-700 font-semibold">{user.role}</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
