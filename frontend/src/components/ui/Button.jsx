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
  const Comp = asChild ? Slot : "button"
  
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "underline-offset-4 hover:underline text-primary"
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
