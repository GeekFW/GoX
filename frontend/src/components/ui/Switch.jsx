import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * Switch组件
 * 用于开关状态的切换
 */
const Switch = React.forwardRef(({ className, checked, onCheckedChange, disabled = false, ...props }, ref) => {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked)
    }
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        className
      )}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        backgroundColor: checked ? "hsl(var(--primary))" : "hsl(var(--input))"
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      {...props}
    >
      <motion.span
        className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0"
        animate={{
          x: checked ? 20 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      />
    </motion.button>
  )
})
Switch.displayName = "Switch"

export { Switch }
export default Switch