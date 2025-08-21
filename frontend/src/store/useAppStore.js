import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
      
      // 服务器管理
      addServer: (server) => set((state) => ({
        servers: [...state.servers, { ...server, id: Date.now().toString() }]
      })),
      
      updateServer: (id, updates) => set((state) => ({
        servers: state.servers.map(server => 
          server.id === id ? { ...server, ...updates } : server
        )
      })),
      
      removeServer: (id) => set((state) => ({
        servers: state.servers.filter(server => server.id !== id),
        activeServer: state.activeServer?.id === id ? null : state.activeServer
      })),
      
      setActiveServer: (server) => set({ activeServer: server }),
      setProxyStatus: (status) => set({ proxyStatus: status }),
      
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