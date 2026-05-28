import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';

interface AdminPayment {
  id: string;
  rideId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  user: { fullName: string; email: string };
  ride: { pickupAddress: string; destinationAddress: string };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [filtered, setFiltered] = useState<AdminPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFiltered(payments);
    } else {
      setFiltered(payments.filter((p) => p.status === statusFilter));
    }
  }, [payments, statusFilter]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/payments');
      const data = res.data.data || res.data;
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCEEDED': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      case 'REFUNDED': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'pending collection';
      case 'SUCCEEDED': return 'succeeded';
      default: return status.toLowerCase();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const totalRevenue = payments
    .filter((p) => p.status === 'SUCCEEDED')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);

  const statuses = ['all', 'PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading payments..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payments</h1>

        {/* Revenue Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">Confirmed Revenue</p>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">Pending Collection</p>
            <p className="text-2xl font-bold text-yellow-600">${totalPending.toFixed(2)}</p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-accent text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : getStatusLabel(status).replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Payment Count */}
        <p className="text-xs text-gray-500 mb-3">{filtered.length} payments</p>

        {/* Payments List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <span className="text-4xl">💳</span>
            <p className="text-gray-500 mt-3">No payments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400">{payment.currency}</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {getStatusLabel(payment.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{payment.user.fullName}</p>
                  </div>
                  <span className="text-xs text-gray-300">{formatDate(payment.createdAt)}</span>
                </div>

                <div className="text-xs text-gray-400">
                  <p className="line-clamp-1">{payment.ride.pickupAddress}</p>
                  <p>→ {payment.ride.destinationAddress}</p>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between text-[10px] text-gray-300">
                  <span>ID: {payment.id.slice(0, 8)}...</span>
                  <span>Ride: {payment.rideId.slice(0, 8)}...</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
