import React from 'react'
import { Home, Server, Settings, Activity } from 'lucide-react'
import { cn } from '../lib/utils'
import useAppStore from '../store/useAppStore'
import { Button } from './ui/Button'

/**
 * 导航菜单组件
 */
const Navigation = () => {
  const { currentPage, setCurrentPage } = useAppStore()

  const menuItems = [
    {
      id: 'home',
      label: '首页',
      icon: Home,
      description: '服务器状态和日志'
    },
    {
      id: 'servers',
      label: '服务器',
      icon: Server,
      description: '管理代理服务器'
    },
    {
      id: 'logs',
      label: '日志',
      icon: Activity,
      description: '查看应用日志'
    },
    {
      id: 'settings',
      label: '设置',
      icon: Settings,
      description: '应用程序设置'
    }
  ]

  return (
    <nav className="flex items-center space-x-1 px-4 py-2 bg-background border-b border-border">
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = currentPage === item.id
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            className="flex items-center space-x-2 px-3 py-2 h-auto text-sm font-medium"
            onClick={() => setCurrentPage(item.id)}
            title={item.description}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
            {isActive && (
              <div className="w-1 h-1 bg-primary-foreground rounded-full" />
            )}
          </Button>
        )
      })}
    </nav>
  )
}

export default Navigation