import React from 'react'
import { motion } from 'framer-motion'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * 标签变体配置
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/**
 * 标签组件
 */
const Label = React.forwardRef(({ className, ...props }, ref) => (
  <motion.label
    ref={ref}
    className={cn(labelVariants(), className)}
    whileHover={{
      scale: 1.02,
      color: "hsl(var(--primary))"
    }}
    transition={{
      duration: 0.2,
      ease: "easeInOut"
    }}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }
export default Label