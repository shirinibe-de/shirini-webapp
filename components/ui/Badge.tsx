interface BadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  children?: React.ReactNode
}

export function Badge({ status, children }: BadgeProps) {
  const classes = {
    pending: 'backdrop-blur-md bg-amber-500/30 text-amber-100 border border-amber-400/40 hover:border-amber-300/60',
    approved: 'backdrop-blur-md bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 hover:border-emerald-300/60',
    rejected: 'backdrop-blur-md bg-red-500/30 text-red-100 border border-red-400/40 hover:border-red-300/60',
    expired: 'backdrop-blur-md bg-slate-500/30 text-slate-100 border border-slate-400/40 hover:border-slate-300/60',
  }

  const icons = {
    pending: '⏳',
    approved: '✓',
    rejected: '✗',
    expired: '⌛',
  }

  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    expired: 'Expired',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${classes[status]}`}>
      <span>{icons[status]}</span>
      {children || labels[status]}
    </span>
  )
}
