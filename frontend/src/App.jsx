import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MainLayout from './components/MainLayout'
import ThemeProvider from './components/ThemeProvider'
import { ToastProvider } from './components/ui/Toast'
import HomePage from './pages/HomePage'
import ServersPage from './pages/ServersPage'
import LogsPage from './pages/LogsPage'
import SettingsPage from './pages/SettingsPage'
import useAppStore from './store/useAppStore'

/**
 * 主应用组件
 */
function App() {
  const { currentPage } = useAppStore()

  // 页面切换动画配置
  const pageVariants = {
    initial: {
      opacity: 0,
      x: 20,
      scale: 0.98
    },
    in: {
      opacity: 1,
      x: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      x: -20,
      scale: 0.98
    }
  }

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3
  }

  // 根据当前页面渲染不同内容
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'servers':
        return <ServersPage />
      case 'logs':
        return <LogsPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <HomePage />
    }
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <MainLayout>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="h-full"
            >
              {renderCurrentPage()}
            </motion.div>
          </AnimatePresence>
        </MainLayout>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
