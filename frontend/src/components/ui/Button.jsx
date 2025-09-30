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
  
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none font-roboto"
  
  const variants = {
    default: "bg-gray-500 text-white hover:bg-gray-400 focus:ring-gray-500 font-semibold",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "border border-gray-500 bg-transparent text-gray-400 hover:bg-gray-500 hover:text-white focus:ring-gray-500 transition-all duration-300",
    secondary: "bg-gray-800 text-white hover:bg-gray-600 focus:ring-gray-500",
    ghost: "text-white hover:bg-gray-500/10 hover:text-gray-400 focus:ring-gray-500",
    link: "underline-offset-4 hover:underline text-gray-400",
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
