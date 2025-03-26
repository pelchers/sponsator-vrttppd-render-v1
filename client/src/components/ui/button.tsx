import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'spring' | 'turquoise' | 'orange' | 'lemon' | 'red' | 'white' | 'black' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const buttonStyles = {
  base: `
    relative
    inline-flex
    items-center
    justify-center
    rounded-full
    border-2
    border-black
    px-4
    py-2
    text-sm
    font-medium
    text-black
    transition-all
    duration-200
    transform
    hover:-translate-y-0.5
    active:translate-y-0
    active:scale-95
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    disabled:opacity-50
    disabled:cursor-not-allowed
    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
    hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
    active:shadow-none
  `,
  variants: {
    spring: `
      bg-spring
      hover:bg-spring
      active:bg-spring
    `,
    turquoise: `
      bg-turquoise
      hover:bg-turquoise
      active:bg-turquoise
    `,
    orange: `
      bg-orange
      hover:bg-orange
      active:bg-orange
    `,
    lemon: `
      bg-lemon
      hover:bg-lemon
      active:bg-lemon
    `,
    red: `
      bg-red
      hover:bg-red
      active:bg-red
    `,
    white: `
      bg-neutral-white
      hover:bg-neutral-white
      active:bg-neutral-white
    `,
    black: `
      bg-neutral-900
      hover:bg-neutral-900
      active:bg-neutral-900
      text-white
    `,
    ghost: `
      bg-transparent
      border-transparent
      shadow-none
      hover:bg-transparent
      hover:border-transparent
      hover:shadow-none
      active:bg-transparent
      active:shadow-none
    `
  },
  sizes: {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  }
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "spring", size = "md", isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonStyles.base,
          buttonStyles.variants[variant],
          buttonStyles.sizes[size],
          "animate-bounce-on-click",
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : null}
        <span className={cn(isLoading ? "opacity-0" : "opacity-100")}>
          {children}
        </span>
      </button>
    )
  }
)

Button.displayName = "Button" 