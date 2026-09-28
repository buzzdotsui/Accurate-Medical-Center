import { cn } from "@/lib/utils/cn"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-black/[0.04]", className)}
      {...props}
    />
  )
}

export { Skeleton }
