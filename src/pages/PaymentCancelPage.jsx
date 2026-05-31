import { Link } from 'react-router-dom';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-dark-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-warning-500/5 via-transparent to-danger-500/5" />

      <div className="relative bg-white rounded-3xl border border-dark-200 shadow-2xl shadow-warning-500/10 p-8 sm:p-12 max-w-lg w-full text-center">
        {/* Cancel icon */}
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 rounded-full bg-warning-500/10 animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-warning-400 to-warning-600 flex items-center justify-center shadow-xl shadow-warning-500/30">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-dark-900 mb-2">Payment Cancelled</h1>
        <p className="text-dark-500 text-base mb-3">
          Your payment was not processed. Don't worry — no charges have been made.
        </p>
        <p className="text-dark-400 text-sm mb-8">
          Your reservation is still pending. You can try paying again or browse other parking options.
        </p>

        {/* Info card */}
        <div className="bg-warning-50 rounded-2xl border border-warning-100 p-5 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-warning-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-warning-700 text-left">
              If you experienced an issue, please try again or contact our support team for assistance.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/parkings"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-all shadow-lg shadow-primary-600/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Browse Parkings
          </Link>
          <Link
            to="/reservations"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-dark-100 hover:bg-dark-200 text-dark-700 font-bold text-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Reservations
          </Link>
        </div>

        <Link to="/" className="inline-block mt-5 text-sm text-dark-400 hover:text-primary-600 transition-colors font-medium">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
