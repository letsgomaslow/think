import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const skeletonVariants = cva(
  "animate-pulse bg-slate-800/50",
  {
    variants: {
      variant: {
        text: "rounded h-5",
        circular: "rounded-full",
        rectangular: "rounded-lg",
      },
    },
    defaultVariants: {
      variant: "rectangular",
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number
  height?: string | number
}

function Skeleton({
  className,
  variant,
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const inlineStyles = {
    ...style,
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  }

  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      style={inlineStyles}
      {...props}
    />
  )
}

export { Skeleton, skeletonVariants }
