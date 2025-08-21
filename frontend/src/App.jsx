import React from 'react'
import MainLayout from './components/MainLayout'
import ThemeProvider from './components/ThemeProvider'
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
      <MainLayout>
        {renderCurrentPage()}
      </MainLayout>
    </ThemeProvider>
  )
}

export default App
