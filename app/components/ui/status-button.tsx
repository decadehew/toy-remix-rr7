import * as React from 'react'
import { Button } from './button'
import { cn } from '~/lib/utils'

export const StatusButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    status: 'pending' | 'success' | 'error' | 'idle'
  }
>(({ status = 'idle', className, children, ...props }, ref) => {
  const companion = {
    pending: <span className="inline-block animate-spin">🌀</span>,
    success: <span>✅</span>,
    error: <span>❌</span>,
    idle: null,
  }[status]
  return (
    <Button
      ref={ref}
      className={cn('flex justify-center gap-4', className)}
      {...props}
    >
      <div>{children}</div>
      {companion}
    </Button>
  )
})

StatusButton.displayName = 'Button'
