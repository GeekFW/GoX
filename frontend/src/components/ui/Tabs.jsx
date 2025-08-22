import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * Tabs上下文
 */
const TabsContext = React.createContext({})

/**
 * Tabs根组件
 */
const Tabs = React.forwardRef(({ className, value, onValueChange, defaultValue, orientation = "horizontal", ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '')
  const currentValue = value !== undefined ? value : internalValue
  
  const handleValueChange = React.useCallback((newValue) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }, [value, onValueChange])

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, orientation }}>
      <div
        ref={ref}
        className={cn(
          "w-full",
          orientation === "vertical" && "flex",
          className
        )}
        {...props}
      />
    </TabsContext.Provider>
  )
})
Tabs.displayName = "Tabs"

/**
 * TabsList组件
 */
const TabsList = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = React.useContext(TabsContext)
  
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        orientation === "vertical" && "flex-col h-auto w-auto",
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = "TabsList"

/**
 * TabsTrigger组件
 */
const TabsTrigger = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { value: selectedValue, onValueChange, orientation } = React.useContext(TabsContext)
  const isSelected = selectedValue === value
  
  return (
    <motion.button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative",
        isSelected
          ? "text-foreground"
          : "hover:bg-background/50 hover:text-foreground",
        orientation === "vertical" && "w-full justify-start",
        className
      )}
      onClick={() => onValueChange(value)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {isSelected && (
        <motion.div
          className="absolute inset-0 bg-background shadow-sm rounded-sm"
          layoutId="activeTab"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

/**
 * TabsContent组件
 */
const TabsContent = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { value: selectedValue } = React.useContext(TabsContext)
  
  return (
    <AnimatePresence mode="wait">
      {selectedValue === value && (
        <motion.div
          ref={ref}
          className={cn(
            "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.2,
            ease: "easeInOut"
          }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
export default Tabs