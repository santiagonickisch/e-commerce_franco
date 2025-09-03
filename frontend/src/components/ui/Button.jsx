import React from 'react'
import { cn } from '@/utils/cn'

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props 
}, ref) => {
  const Comp = asChild ? "span" : "button"
  
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  
  const variants = {
    default: "bg-gold-500 text-black hover:bg-gold-400 focus:ring-gold-500 font-semibold",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "border border-gold-500 bg-transparent text-gold-400 hover:bg-gold-500 hover:text-black focus:ring-gold-500 transition-all duration-300",
    secondary: "bg-elegant-gray text-white hover:bg-elegant-light focus:ring-gold-500",
    ghost: "text-white hover:bg-gold-500/10 hover:text-gold-400 focus:ring-gold-500",
    link: "underline-offset-4 hover:underline text-gold-400",
    elegant: "elegant-button"
  }
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10"
  }

  return (
    <Comp
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        loading && "opacity-50 cursor-not-allowed",
        className
      )}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </Comp>
  )
})

Button.displayName = "Button"

export default Button
