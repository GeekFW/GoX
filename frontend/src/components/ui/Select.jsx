import React from 'react'
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
    <button
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      {...props}
    >
      {children}
      <ChevronDown className={cn(
        "h-4 w-4 opacity-50 transition-transform",
        isOpen && "rotate-180"
      )} />
    </button>
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
  
  if (!isOpen) return null
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full z-50 mt-1 w-full rounded-md border bg-popover/95 backdrop-blur-sm text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={{
        backgroundColor: 'hsl(var(--popover))',
        backdropFilter: 'blur(8px)'
      }}
      {...props}
    >
      <div className="p-1">
        {children}
      </div>
    </div>
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
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
export default Select