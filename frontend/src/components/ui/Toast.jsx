import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Toast上下文
 */
const ToastContext = createContext({})

/**
 * Toast Provider组件
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    const newToast = { id, ...toast }
    setToasts(prev => [...prev, newToast])

    // 自动移除toast
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 3000)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const value = {
    toasts,
    addToast,
    removeToast
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

/**
 * Toast容器组件
 */
const ToastContainer = () => {
  const { toasts } = useContext(ToastContext)

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

/**
 * Toast组件
 */
const Toast = ({ id, title, description, variant = 'default', action }) => {
  const { removeToast } = useContext(ToastContext)

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'info':
        return <Info className="h-4 w-4" />
      default:
        return null
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800'
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800'
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800'
      default:
        return 'border-border bg-background text-foreground'
    }
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 100,
        scale: 0.9
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1
      }}
      exit={{
        opacity: 0,
        x: 100,
        scale: 0.9
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
      className={cn(
        "relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm",
        getVariantStyles()
      )}
    >
      {getIcon() && (
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
      )}
      
      <div className="flex-1 space-y-1">
        {title && (
          <div className="text-sm font-semibold">
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm opacity-90">
            {description}
          </div>
        )}
        {action && (
          <div className="mt-2">
            {action}
          </div>
        )}
      </div>

      <motion.button
        className="flex-shrink-0 rounded-md p-1 hover:bg-black/10 transition-colors"
        onClick={() => removeToast(id)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="h-4 w-4" />
      </motion.button>
    </motion.div>
  )
}

/**
 * useToast Hook
 */
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const { addToast } = context

  const toast = useCallback({
    success: (title, description, options = {}) => 
      addToast({ title, description, variant: 'success', ...options }),
    error: (title, description, options = {}) => 
      addToast({ title, description, variant: 'error', ...options }),
    warning: (title, description, options = {}) => 
      addToast({ title, description, variant: 'warning', ...options }),
    info: (title, description, options = {}) => 
      addToast({ title, description, variant: 'info', ...options }),
    default: (title, description, options = {}) => 
      addToast({ title, description, variant: 'default', ...options })
  }, [addToast])

  return { toast }
}

export { Toast }
export default Toast