interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  asChild = false,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-900 text-white hover:bg-gray-800',
    outline: 'border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'
  }

  const sizes = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const Comp = asChild ? 'div' : 'button'

  return (
    <Comp
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props as any}
    >
      {children}
    </Comp>
  )
} 