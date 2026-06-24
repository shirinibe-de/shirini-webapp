interface BadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  children?: React.ReactNode
}

export function Badge({ status, children }: BadgeProps) {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
  }

  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    expired: 'Expired',
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${classes[status]}`}>
      {children || labels[status]}
    </span>
  )
}
