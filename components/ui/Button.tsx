import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400/50'

  const variantClasses = {
    primary: 'backdrop-blur-xl bg-indigo-500/40 border border-indigo-400/50 text-white hover:bg-indigo-500/60 hover:border-indigo-300/80 shadow-lg hover:shadow-xl hover:shadow-indigo-500/20',
    secondary: 'backdrop-blur-lg bg-white/20 border border-white/30 text-white hover:bg-white/30',
    danger: 'backdrop-blur-xl bg-red-500/40 border border-red-400/50 text-white hover:bg-red-500/60 hover:border-red-300/80 shadow-lg hover:shadow-red-500/20',
    ghost: 'backdrop-blur-sm bg-white/5 border border-white/20 text-indigo-200 hover:bg-white/10 hover:border-white/40',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3 text-lg',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? '⏳' : children}
    </button>
  )
}
