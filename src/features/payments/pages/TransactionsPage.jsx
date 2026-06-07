import { useState, useEffect, useCallback } from 'react';
import { paymentsAPI } from '../paymentsAPI';
import { useAuth } from '../../../context/AuthContext';
import { formatDateTime, formatCurrency } from '../../../utils/formatDate';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [detailTx, setDetailTx] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const applyFilters = useCallback(() => {
    let result = [...transactions];

    // Status Filter
    if (statusFilter !== 'ALL') {
      result = result.filter((tx) => tx.status === statusFilter);
    }

    // Search Term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter((tx) => {
        const txIdMatch = String(tx.id).includes(term);
        const reservationIdMatch = String(tx.paymentableId).includes(term);
        const methodMatch = tx.method?.toLowerCase().includes(term);
        const amountMatch = String(tx.amount).includes(term);

        let userMatch = false;
        if (tx.reservation?.user) {
          const fullName = `${tx.reservation.user.firstName || ''} ${tx.reservation.user.lastName || ''}`.toLowerCase();
          const email = (tx.reservation.user.email || '').toLowerCase();
          userMatch = fullName.includes(term) || email.includes(term);
        }

        return txIdMatch || reservationIdMatch || methodMatch || amountMatch || userMatch;
      });
    }

    setFilteredTransactions(result);
  }, [transactions, searchTerm, statusFilter]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await paymentsAPI.getAll();
      setTransactions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionDetail = async (id) => {
    setDetailLoading(true);
    setDetailError('');
    try {
      const response = await paymentsAPI.getById(id);
      setDetailTx(response.data);
    } catch (err) {
      setDetailError(err.response?.data?.message || 'Failed to load transaction details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenDetail = (id) => {
    setSelectedTxId(id);
    setDetailTx(null);
    fetchTransactionDetail(id);
  };

  const handleCloseDetail = () => {
    setSelectedTxId(null);
    setDetailTx(null);
  };

  const hasRequestedRefund = (tx) => {
    return tx?.eventLogs?.some((log) => log.status === 'REFUND_REQUESTED') || false;
  };

  const handleRequestRefund = async (id) => {
    try {
      setError('');
      await paymentsAPI.requestRefund(id);
      fetchTransactions();
      if (selectedTxId === id) {
        fetchTransactionDetail(id);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to request refund';
      if (selectedTxId === id) setDetailError(errMsg);
      else setError(errMsg);
    }
  };

  const handleApproveRefund = async (id) => {
    try {
      setError('');
      await paymentsAPI.approveRefund(id);
      fetchTransactions();
      if (selectedTxId === id) {
        fetchTransactionDetail(id);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to approve refund';
      if (selectedTxId === id) setDetailError(errMsg);
      else setError(errMsg);
    }
  };

  const handleRejectRefund = async (id) => {
    try {
      setError('');
      await paymentsAPI.rejectRefund(id);
      fetchTransactions();
      if (selectedTxId === id) {
        fetchTransactionDetail(id);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to reject refund';
      if (selectedTxId === id) setDetailError(errMsg);
      else setError(errMsg);
    }
  };


  // Metrics
  const successTx = transactions.filter((t) => t.status === 'SUCCESS');
  const pendingTx = transactions.filter((t) => t.status === 'PENDING');
  const failedTx = transactions.filter((t) => t.status === 'FAILED');

  const totalAmount = successTx.reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const statusStyles = {
    PENDING: 'bg-warning-100 text-warning-500 border border-warning-100',
    SUCCESS: 'bg-accent-100 text-accent-600 border border-accent-100',
    FAILED: 'bg-danger-50 text-danger-500 border border-danger-100',
    PROCESSING: 'bg-info-100 text-info-600 border border-info-100',
    REFUNDED: 'bg-neutral-100 text-neutral-600 border border-neutral-100',
    PARTIALLY_REFUNDED: 'bg-neutral-100 text-neutral-600 border border-neutral-100',
    REFUND_REQUESTED: 'bg-warning-50 text-warning-600 border border-warning-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Transactions</h1>
          <p className="text-dark-500 mt-1">
            {isAdmin ? 'Monitor system-wide payment events' : 'View your payment transaction history'}
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          className="p-2.5 rounded-xl border border-dark-200 bg-white hover:bg-dark-50 text-dark-600 transition-colors flex items-center gap-2 text-sm font-semibold cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">{isAdmin ? 'Total Revenue' : 'Total Spent'}</p>
            <p className="text-xl font-extrabold text-dark-800 mt-1">{formatCurrency(totalAmount)}</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center text-accent-600 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Completed</p>
            <p className="text-xl font-extrabold text-dark-800 mt-1">{successTx.length} payments</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center text-warning-500 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Pending</p>
            <p className="text-xl font-extrabold text-dark-800 mt-1">{pendingTx.length} payments</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl border border-dark-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-danger-50 flex items-center justify-center text-danger-500 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Refused</p>
            <p className="text-xl font-extrabold text-dark-800 mt-1">{failedTx.length} payments</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-dark-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Tabs */}
        <div className="flex bg-dark-50 p-1 rounded-xl w-full md:w-auto">
          {['ALL', 'SUCCESS', 'PENDING', 'FAILED', 'REFUND_REQUESTED', 'REFUNDED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-dark-900 shadow-sm'
                  : 'text-dark-500 hover:text-dark-800'
              }`}
            >
              {tab === 'SUCCESS' ? 'COMPLETED' : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-dark-200 bg-dark-50 text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-600 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-dark-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-50 text-left border-b border-dark-200">
                  <th className="px-6 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wider">TX ID</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wider">Paymentable</th>
                  {isAdmin && <th className="px-6 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wider">Client</th>}
                  <th className="px-6 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-dark-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-dark-600">#{tx.id}</td>
                    <td className="px-6 py-4 text-sm text-dark-500">{formatDateTime(tx.paymentDateTime || tx.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-dark-600">
                      <span className="capitalize font-medium text-dark-800">{tx.paymentableType}</span>{' '}
                      <span className="text-xs text-dark-400">#{tx.paymentableId}</span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-sm text-dark-600">
                        {tx.reservation?.user ? (
                          <div>
                            <p className="font-semibold text-dark-800">
                              {tx.reservation.user.firstName} {tx.reservation.user.lastName}
                            </p>
                            <p className="text-xs text-dark-400">{tx.reservation.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-dark-400">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-dark-600 uppercase font-mono">{tx.method || 'stripe'}</td>
                    <td className="px-6 py-4 text-sm font-extrabold text-dark-900">{formatCurrency(tx.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${statusStyles[tx.status] || 'bg-dark-100 text-dark-600'}`}>
                        {tx.status === 'SUCCESS' ? 'COMPLETED' : tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(tx.id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        {tx.status === 'SUCCESS' && !isAdmin && !hasRequestedRefund(tx) && (
                          <button
                            onClick={() => handleRequestRefund(tx.id)}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-warning-500 hover:bg-warning-600 text-white transition-colors cursor-pointer shadow-sm shadow-warning-500/10"
                          >
                            Refund
                          </button>
                        )}
                        {tx.status === 'REFUND_REQUESTED' && isAdmin && (
                          <>
                            <button
                              onClick={() => handleApproveRefund(tx.id)}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-accent-600 hover:bg-accent-700 text-white transition-colors cursor-pointer shadow-sm shadow-accent-600/10"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRefund(tx.id)}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-danger-500 hover:bg-danger-600 text-white transition-colors cursor-pointer shadow-sm shadow-danger-500/10"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredTransactions.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-dark-50 text-dark-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-dark-500 font-medium text-base">No transactions matched your filters.</p>
            <p className="text-dark-400 text-sm mt-1">Try resetting the status filter or query.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedTxId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white rounded-3xl border border-dark-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-dark-100 flex items-center justify-between bg-dark-50">
              <div>
                <h3 className="text-lg font-extrabold text-dark-900">Transaction Details</h3>
                <p className="text-xs text-dark-400 mt-0.5">TX ID #{selectedTxId}</p>
              </div>
              <button
                onClick={handleCloseDetail}
                className="p-2 rounded-xl text-dark-400 hover:text-dark-700 hover:bg-dark-100 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <p className="text-xs text-dark-400 font-semibold">Loading events audit trail...</p>
                </div>
              ) : detailError ? (
                <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-600 text-sm">
                  {detailError}
                </div>
              ) : detailTx ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-dark-50 border border-dark-100 rounded-2xl">
                      <p className="text-[10px] font-bold text-dark-400 uppercase tracking-wider">Amount Paid</p>
                      <p className="text-lg font-black text-dark-900 mt-1">{formatCurrency(detailTx.amount)}</p>
                    </div>
                    <div className="p-4 bg-dark-50 border border-dark-100 rounded-2xl">
                      <p className="text-[10px] font-bold text-dark-400 uppercase tracking-wider">Status</p>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold mt-2 ${statusStyles[detailTx.status] || 'bg-dark-100 text-dark-600'}`}>
                        {detailTx.status === 'SUCCESS' ? 'COMPLETED' : detailTx.status}
                      </span>
                    </div>
                  </div>

                  {/* Transaction info details */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-dark-400 tracking-wider">General Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between py-1.5 border-b border-dark-50">
                        <span className="text-dark-500 font-medium">Payment Date:</span>
                        <span className="text-dark-800 font-bold">{formatDateTime(detailTx.paymentDateTime)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-dark-50">
                        <span className="text-dark-500 font-medium">Method:</span>
                        <span className="text-dark-800 font-bold uppercase">{detailTx.method || 'stripe'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-dark-50 md:col-span-2">
                        <span className="text-dark-500 font-medium shrink-0">Stripe Session ID:</span>
                        <span className="text-dark-800 font-mono text-xs break-all text-right">{detailTx.stripeSessionId || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Connected Entity details */}
                  {detailTx.reservation && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold uppercase text-dark-400 tracking-wider">Reservation Details</h4>
                      <div className="p-4 bg-primary-50/50 border border-primary-100/50 rounded-2xl space-y-2 text-sm text-dark-800">
                        <div className="flex justify-between">
                          <span className="text-dark-500 font-medium">Reservation ID:</span>
                          <span className="font-bold text-primary-700">#{detailTx.reservation.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-500 font-medium">Parking Lot:</span>
                          <span className="font-bold text-dark-950">{detailTx.reservation.parkingLot?.name || 'Parking Lot'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-500 font-medium">Duration:</span>
                          <span className="font-bold text-dark-700 text-xs">
                            {formatDateTime(detailTx.reservation.startTimeDate)} - {formatDateTime(detailTx.reservation.endTimeDate)}
                          </span>
                        </div>
                        {detailTx.reservation.user && (
                          <div className="pt-2 border-t border-primary-100/40 mt-2">
                            <p className="text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1">Customer</p>
                            <p className="font-semibold text-dark-800">
                              {detailTx.reservation.user.firstName} {detailTx.reservation.user.lastName}
                            </p>
                            <p className="text-xs text-dark-400">{detailTx.reservation.user.email}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Audit Logs Trail */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold uppercase text-dark-400 tracking-wider">Immutable Audit Trail (Event Logs)</h4>
                    
                    {detailTx.eventLogs && detailTx.eventLogs.length > 0 ? (
                      <div className="relative pl-6 border-l border-dark-200 ml-3 space-y-6 py-2">
                        {detailTx.eventLogs.map((log) => (
                          <div key={log.id} className="relative">
                            {/* Dot indicator */}
                            <span className={`absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 ${
                              log.status === 'SUCCESS'
                                ? 'border-accent-500'
                                : log.status === 'PENDING'
                                ? 'border-warning-500'
                                : 'border-danger-500'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                log.status === 'SUCCESS'
                                  ? 'bg-accent-500'
                                  : log.status === 'PENDING'
                                  ? 'bg-warning-500'
                                  : 'bg-danger-500'
                              }`} />
                            </span>

                            {/* Log Info */}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[log.status] || 'bg-dark-100 text-dark-600'}`}>
                                  {log.status === 'SUCCESS' ? 'COMPLETED' : log.status}
                                </span>
                                <span className="text-[11px] text-dark-400 font-mono">
                                  {formatDateTime(log.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-dark-700 mt-1 font-medium bg-dark-50 p-2.5 rounded-xl border border-dark-100/50">
                                {log.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-dark-400 italic">No event logs recorded for this transaction.</p>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-dark-100 bg-dark-50 flex justify-between items-center gap-4">
              <div>
                {detailTx && detailTx.status === 'SUCCESS' && !isAdmin && !hasRequestedRefund(detailTx) && (
                  <button
                    onClick={() => handleRequestRefund(detailTx.id)}
                    className="px-5 py-2.5 rounded-xl bg-warning-500 hover:bg-warning-600 text-white font-semibold text-sm transition-all cursor-pointer shadow-md shadow-warning-500/20"
                  >
                    Request Refund
                  </button>
                )}
                {detailTx && detailTx.status === 'REFUND_REQUESTED' && isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveRefund(detailTx.id)}
                      className="px-5 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-semibold text-sm transition-all cursor-pointer shadow-md shadow-accent-600/20"
                    >
                      Approve Refund
                    </button>
                    <button
                      onClick={() => handleRejectRefund(detailTx.id)}
                      className="px-5 py-2.5 rounded-xl bg-danger-500 hover:bg-danger-600 text-white font-semibold text-sm transition-all cursor-pointer shadow-md shadow-danger-500/20"
                    >
                      Reject Refund
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleCloseDetail}
                className="px-5 py-2.5 rounded-xl bg-dark-800 text-white hover:bg-dark-900 font-semibold text-sm transition-all cursor-pointer shadow-md"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
