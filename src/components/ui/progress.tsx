import { cn } from '@/lib/cn'
import * as React from 'react'

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    max?: number
    indicatorClassName?: string
  }
>(({ className, value, max = 100, indicatorClassName, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        'bg-muted relative h-2 w-full overflow-hidden rounded-full',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'bg-primary h-full w-full flex-1 transition-all',
          indicatorClassName
        )}
        style={{
          transform: `translateX(-${100 - ((value || 0) / max) * 100}%)`
        }}
      />
    </div>
  )
})
Progress.displayName = 'Progress'

export { Progress }
