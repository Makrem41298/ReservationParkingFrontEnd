import { formatDateTime, formatCurrency } from '../../../utils/formatDate';

const statusStyles = {
  PENDING:    'bg-warning-500/10 text-warning-600 border-warning-500/20',
  CONFIRMED:  'bg-accent-500/10 text-accent-600 border-accent-500/20',
  CHECKED_IN: 'bg-info-500/10 text-info-600 border-info-500/20',
  COMPLETED:  'bg-primary-500/10 text-primary-600 border-primary-500/20',
  CANCELED:   'bg-danger-500/10 text-danger-600 border-danger-500/20',
  EXPIRED:    'bg-dark-500/10 text-dark-500 border-dark-500/20',
  NO_SHOW:    'bg-neutral-500/10 text-neutral-600 border-neutral-500/20',
};

export default function ReservationDetailModal({ reservation, onClose }) {
  if (!reservation) return null;

  const InfoRow = ({ label, value }) => (
    <div className="flex items-start justify-between py-3 border-b border-dark-100 last:border-0">
      <span className="text-sm font-medium text-dark-500 w-36 shrink-0">{label}</span>
      <span className="text-sm text-dark-800 text-right">{value || '—'}</span>
    </div>
  );

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-[fadeIn_0.15s_ease-out]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-dark-50 border-b border-dark-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-md shadow-primary-600/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-dark-900">Reservation #{reservation.id}</h2>
              <p className="text-xs text-dark-500">Details &amp; QR Code</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[reservation.status] || 'bg-dark-100 text-dark-600'}`}>
              {reservation.status}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-200 text-dark-500 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-0">
            <InfoRow label="Parking Lot"  value={reservation.parkingLot?.name || `#${reservation.parkingLotId}`} />
            <InfoRow label="Start Date"   value={formatDateTime(reservation.startTimeDate)} />
            <InfoRow label="End Date"     value={formatDateTime(reservation.endTimeDate)} />
            <InfoRow label="Total Price"  value={formatCurrency(reservation.totalPrice)} />
            <InfoRow label="Entry Time"   value={reservation.entryTime ? formatDateTime(reservation.entryTime) : null} />
            <InfoRow label="Leave Time"   value={reservation.leaveTime ? formatDateTime(reservation.leaveTime) : null} />
          </div>

          {/* QR Code section */}
          {reservation.qrCode ? (
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="w-full h-px bg-dark-100" />
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mt-1">Entry QR Code</p>
              <div className="p-3 bg-white rounded-2xl border-2 border-dark-100 shadow-inner">
                <img
                  src={reservation.qrCode}
                  alt={`QR Code for reservation #${reservation.id}`}
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="text-xs text-dark-400 text-center">
                Show this code at the parking entrance to check in.
              </p>
              {/* Download button */}
              <a
                href={reservation.qrCode}
                download={`reservation-${reservation.id}-qr.png`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download QR
              </a>
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center gap-2 py-4">
              <div className="w-full h-px bg-dark-100 mb-2" />
              <div className="w-12 h-12 rounded-xl bg-dark-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <p className="text-sm text-dark-500 font-medium">QR code not yet available</p>
              <p className="text-xs text-dark-400 text-center">Complete your payment to receive your entry QR code.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-dark-100 bg-dark-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-dark-900 hover:bg-dark-700 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
