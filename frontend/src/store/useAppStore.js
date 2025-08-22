import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  AddServer, 
  UpdateServer, 
  RemoveServer, 
  ListServers, 
  ValidateServerName,
  StartProxy,
  StopProxy,
  GetProxyStatus
} from '../../wailsjs/go/main/App'

/**
 * 应用程序状态管理
 */
const useAppStore = create(
  persist(
    (set, get) => ({
      // 主题设置
      theme: 'dark', // 'light' | 'dark'
      themeColor: 'blue', // 主题色
      
      // UI状态
      currentPage: 'home', // 当前页面
      sidebarCollapsed: false, // 侧边栏是否折叠
      
      // 服务器状态
      servers: [], // 服务器列表
      activeServer: null, // 当前激活的服务器
      proxyStatus: 'stopped', // 代理状态: 'running' | 'stopped' | 'connecting'
      
      // 系统状态
      systemStats: {
        cpu: 0,
        memory: 0,
        upload: 0,
        download: 0
      },
      
      // 日志
      logs: [],
      logLevel: 'info',
      
      // Actions
      setTheme: (theme) => set({ theme }),
      setThemeColor: (themeColor) => set({ themeColor }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      // 服务器管理 - 集成后端API
      loadServers: async () => {
        try {
          const servers = await ListServers()
          set({ servers })
          return servers
        } catch (error) {
          console.error('Failed to load servers:', error)
          return []
        }
      },
      
      addServer: async (server) => {
        try {
          await AddServer(server)
          // 重新加载服务器列表
          const { loadServers } = get()
          await loadServers()
          return true
        } catch (error) {
          console.error('Failed to create server:', error)
          throw error
        }
      },
      
      updateServer: async (server) => {
        try {
          await UpdateServer(server)
          // 重新加载服务器列表
          const { loadServers } = get()
          await loadServers()
          return true
        } catch (error) {
          console.error('Failed to update server:', error)
          throw error
        }
      },
      
      removeServer: async (id) => {
        try {
          await RemoveServer(id)
          // 重新加载服务器列表
          const { loadServers } = get()
          await loadServers()
          // 如果删除的是当前活动服务器，清除活动状态
          const { activeServer } = get()
          if (activeServer?.id === id) {
            set({ activeServer: null })
          }
          return true
        } catch (error) {
          console.error('Failed to delete server:', error)
          throw error
        }
      },
      
      validateServerName: async (name, excludeID = '') => {
        try {
          await ValidateServerName(name, excludeID)
          return true
        } catch (error) {
          throw error
        }
      },
      
      setActiveServer: (server) => set({ activeServer: server }),
      setProxyStatus: (status) => set({ proxyStatus: status }),
      
      // 代理管理 - 集成后端API
      startProxy: async (server) => {
        try {
          set({ proxyStatus: 'connecting' })
          await StartProxy(server)
          set({ proxyStatus: 'running', activeServer: server })
          return true
        } catch (error) {
          console.error('Failed to start proxy:', error)
          set({ proxyStatus: 'stopped' })
          throw error
        }
      },
      
      stopProxy: async () => {
        try {
          await StopProxy()
          set({ proxyStatus: 'stopped', activeServer: null })
          return true
        } catch (error) {
          console.error('Failed to stop proxy:', error)
          throw error
        }
      },
      
      refreshProxyStatus: async () => {
        try {
          const status = await GetProxyStatus()
          set({ proxyStatus: status })
        } catch (error) {
          console.error('Failed to refresh proxy status:', error)
        }
      },
      
      // 系统状态更新
      updateSystemStats: (stats) => set({ systemStats: stats }),
      
      // 日志管理
      addLog: (log) => set((state) => ({
        logs: [...state.logs.slice(-999), { ...log, timestamp: Date.now() }]
      })),
      
      clearLogs: () => set({ logs: [] }),
      setLogLevel: (level) => set({ logLevel: level }),
      
      // 获取过滤后的日志
      getFilteredLogs: () => {
        const { logs, logLevel } = get()
        const levels = ['debug', 'info', 'warn', 'error']
        const currentLevelIndex = levels.indexOf(logLevel)
        
        return logs.filter(log => {
          const logLevelIndex = levels.indexOf(log.level)
          return logLevelIndex >= currentLevelIndex
        })
      }
    }),
    {
      name: 'gox-client-storage',
      partialize: (state) => ({
        theme: state.theme,
        themeColor: state.themeColor,
        sidebarCollapsed: state.sidebarCollapsed,
        servers: state.servers,
        logLevel: state.logLevel
      })
    }
  )
)

export default useAppStore