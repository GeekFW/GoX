import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Select上下文
 */
const SelectContext = React.createContext({})

/**
 * Select根组件
 */
const Select = ({ children, value, onValueChange, defaultValue, disabled = false }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '')
  const [isOpen, setIsOpen] = React.useState(false)
  const currentValue = value !== undefined ? value : internalValue
  
  const handleValueChange = React.useCallback((newValue) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setIsOpen(false)
  }, [value, onValueChange])

  return (
    <SelectContext.Provider value={{ 
      value: currentValue, 
      onValueChange: handleValueChange,
      isOpen,
      setIsOpen,
      disabled
    }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

/**
 * SelectTrigger组件
 */
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen, setIsOpen, disabled } = React.useContext(SelectContext)
  
  return (
    <motion.button
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        className
      )}
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      whileHover={!disabled ? {
        borderColor: "hsl(var(--border))",
        backgroundColor: "hsl(var(--accent))"
      } : {}}
      whileFocus={{
        scale: 1.02
      }}
      transition={{
        duration: 0.2,
        ease: "easeInOut"
      }}
      {...props}
    >
      {children}
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="h-4 w-4 opacity-50" />
      </motion.div>
    </motion.button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

/**
 * SelectValue组件
 */
const SelectValue = ({ placeholder, className }) => {
  const { value } = React.useContext(SelectContext)
  
  return (
    <span className={cn("block truncate", className)}>
      {value || placeholder}
    </span>
  )
}

/**
 * SelectContent组件
 */
const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen } = React.useContext(SelectContext)
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          className={cn(
            "absolute top-full z-50 mt-1 w-full rounded-md border bg-popover/95 backdrop-blur-sm text-popover-foreground shadow-lg",
            className
          )}
          style={{
            backgroundColor: 'hsl(var(--popover))',
            backdropFilter: 'blur(8px)'
          }}
          initial={{
            opacity: 0,
            scale: 0.95,
            y: -10
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: -10
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut"
          }}
          {...props}
        >
          <div className="p-1">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})
SelectContent.displayName = "SelectContent"

/**
 * SelectItem组件
 */
const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { value: selectedValue, onValueChange } = React.useContext(SelectContext)
  const isSelected = selectedValue === value
  
  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
      onClick={() => onValueChange(value)}
      whileHover={{
        backgroundColor: "hsl(var(--accent))",
        color: "hsl(var(--accent-foreground))"
      }}
      whileTap={{
        scale: 0.98
      }}
      transition={{
        duration: 0.15
      }}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </span>
      {children}
    </motion.div>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
export default Select