import React, { useState, useEffect } from 'react'
import { Server, Activity, Wifi, Plus } from 'lucide-react'
import { cn } from '../lib/utils'
import useAppStore from '../store/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Loading } from '../components/ui/Loading'
import { GetLogLines } from '../../wailsjs/go/main/App'

/**
 * 首页组件
 */
const HomePage = () => {
  const { servers, activeServer, proxyStatus, getFilteredLogs } = useAppStore()
  const storeLogs = getFilteredLogs()
  const [fileLogs, setFileLogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // 解析日志行为对象
  const parseLogLine = (line) => {
    try {
      // 尝试解析JSON格式的日志
      const logObj = JSON.parse(line)
      return {
        timestamp: logObj.timestamp || new Date().toISOString(),
        level: (logObj.level || 'info').toLowerCase(),
        message: logObj.msg || line,
        source: logObj.caller || ''
      }
    } catch {
      // 如果不是JSON格式，尝试解析文本格式
      const match = line.match(/\[(\d{4}-\d{2}-\d{2}T[\d:.+]+)\]\s*\[(\w+)\]\s*(.*)$/)
      if (match) {
        return {
          timestamp: match[1],
          level: match[2].toLowerCase(),
          message: match[3],
          source: ''
        }
      }
      // 默认格式
      return {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: line,
        source: ''
      }
    }
  }

  // 读取日志文件
  const loadLogsFromFile = async () => {
    setIsLoading(true)
    try {
      // 检查Go绑定是否可用
      if (typeof window !== 'undefined' && window.go && window.go.main && window.go.main.App) {
        const logLines = await GetLogLines(100) // 读取最后100行
        const parsedLogs = logLines
          .filter(line => line.trim()) // 过滤空行
          .map(parseLogLine)
          .filter(log => log.message.trim()) // 过滤空消息
        
        setFileLogs(parsedLogs)
      } else {
        console.warn('Go bindings not available. Please access the app through the Wails URL (http://localhost:34115) instead of the dev server URL.')
        setFileLogs([])
      }
    } catch (error) {
      console.error('Failed to load logs:', error)
      setFileLogs([])
    } finally {
      setIsLoading(false)
    }
  }

  // 合并store中的日志和文件中的日志
  const allLogs = [...fileLogs, ...storeLogs]

  // 组件挂载时加载日志
  useEffect(() => {
    loadLogsFromFile()
  }, [])

  // 定时刷新日志（每30秒）
  useEffect(() => {
    const interval = setInterval(() => {
      loadLogsFromFile()
    }, 30000) // 30秒刷新一次

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">控制台</h1>
        <p className="text-sm text-muted-foreground">管理您的代理服务器和查看系统状态</p>
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-16">
        {/* 服务器列表卡片 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-primary" />
                <span>服务器列表</span>
              </CardTitle>
              <Button 
                size="sm"
                className="bg-theme hover:bg-theme/50 text-theme-foreground cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!servers || servers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无服务器配置</p>
                <p className="text-sm">点击上方添加按钮创建第一个服务器</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                {servers && servers.map((server) => (
                  <div
                    key={server.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-md border transition-all",
                      activeServer?.id === server.id
                        ? "bg-primary/10 border-primary"
                        : "bg-muted/50 border-border hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        activeServer?.id === server.id && proxyStatus === 'running'
                          ? "bg-green-500"
                          : "bg-gray-400"
                      )} />
                      <div>
                        <div className="font-medium text-card-foreground">{server.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {server.protocol}://{server.address}:{server.port}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        server.protocol === 'vmess' ? 'info' :
                        server.protocol === 'vless' ? 'success' :
                        'secondary'
                      }>
                        {server.protocol.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 当前状态卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-primary" />
              <span>连接状态</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 代理状态 */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">代理状态</span>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  proxyStatus === 'running' ? "bg-green-500" :
                  proxyStatus === 'connecting' ? "bg-yellow-500" :
                  "bg-red-500"
                )} />
                <span className={cn(
                  "font-medium",
                  proxyStatus === 'running' ? "text-green-600 dark:text-green-400" :
                  proxyStatus === 'connecting' ? "text-yellow-600 dark:text-yellow-400" :
                  "text-red-600 dark:text-red-400"
                )}>
                  {proxyStatus === 'running' ? '运行中' :
                   proxyStatus === 'connecting' ? '连接中' : '已停止'}
                </span>
              </div>
            </div>

            {/* 当前服务器 */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">当前服务器</span>
              <span className="font-medium text-card-foreground">
                {activeServer ? activeServer.name : '未选择'}
              </span>
            </div>

            {/* 代理模式 */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">代理模式</span>
              <span className="font-medium text-card-foreground">全局代理</span>
            </div>

            {/* 控制按钮 */}
            <div className="pt-4 border-t border-border">
              <Button 
                className={cn(
                  "w-full transition-all duration-200 transform hover:scale-105 active:scale-95",
                  "bg-theme hover:bg-theme/50 text-theme-foreground shadow-lg hover:shadow-xl cursor-pointer"
                )}
                variant="ghost"
              >
                {proxyStatus === 'running' ? '停止代理' : '启动代理'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 日志卡片 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>系统日志</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-md p-4 h-64 overflow-auto font-mono text-sm">
            {allLogs.length === 0 ? (
              <div className="text-center py-8">
                {isLoading ? (
                  <Loading variant="pulse" text="正在加载日志..." size="default" />
                ) : (
                  <div className="text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>暂无日志信息</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {allLogs.slice(-20).map((log, index) => (
                  <div key={index} className="flex space-x-2">
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {typeof log.timestamp === 'string' ? 
                        new Date(log.timestamp).toLocaleTimeString() :
                        new Date(log.timestamp).toLocaleTimeString()
                      }
                    </span>
                    <span className={cn(
                      "text-xs font-medium",
                      log.level === 'error' ? "text-red-500" :
                      log.level === 'warn' ? "text-yellow-500" :
                      log.level === 'info' ? "text-blue-500" :
                      "text-muted-foreground"
                    )}>
                      [{log.level.toUpperCase()}]
                    </span>
                    {log.source && (
                      <span className="text-primary text-xs font-medium">
                        [{log.source}]
                      </span>
                    )}
                    <span className="text-card-foreground text-xs break-all">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  )
}

export default HomePage