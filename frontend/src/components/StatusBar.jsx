import React from 'react'
import { Wifi, WifiOff, Activity, HardDrive, Upload, Download, Circle, Cpu } from 'lucide-react'
import { cn } from '../lib/utils'
import useAppStore from '../store/useAppStore'
import { Badge } from './ui/Badge'

/**
 * 底部状态栏组件
 */
const StatusBar = () => {
  const { activeServer, proxyStatus, systemStats } = useAppStore()

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getStatusColor = () => {
    switch (proxyStatus) {
      case 'running':
        return 'text-green-500'
      case 'connecting':
        return 'text-yellow-500'
      case 'stopped':
      default:
        return 'text-red-500'
    }
  }

  const getStatusText = () => {
    switch (proxyStatus) {
      case 'running':
        return '运行中'
      case 'connecting':
        return '连接中'
      case 'stopped':
      default:
        return '已停止'
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-6 bg-background border-t border-border flex items-center justify-between px-4 text-xs text-muted-foreground z-50">
      {/* 左侧：服务器状态 */}
      <div className="flex items-center space-x-4">
        {/* 代理状态 */}
        <div className="flex items-center space-x-2">
          {proxyStatus === 'running' ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : proxyStatus === 'connecting' ? (
            <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <Badge variant={
            proxyStatus === 'running' ? 'success' :
            proxyStatus === 'connecting' ? 'warning' :
            'destructive'
          }>
            {proxyStatus === 'running' ? '运行中' :
             proxyStatus === 'connecting' ? '连接中' :
             '已停止'}
          </Badge>
        </div>

        {/* 当前服务器 */}
        {activeServer && (
          <div className="flex items-center space-x-1">
            <Circle className={cn("w-2 h-2 fill-current", getStatusColor())} />
            <span>
              {activeServer.name} ({activeServer.protocol}://{activeServer.address}:{activeServer.port})
            </span>
          </div>
        )}
      </div>

      {/* 右侧：系统状态 */}
      <div className="flex items-center space-x-4">
        {/* CPU使用率 */}
        <div className="flex items-center space-x-1">
          <Cpu className="w-3 h-3" />
          <span>CPU: {systemStats.cpu.toFixed(1)}%</span>
        </div>

        {/* 内存使用率 */}
        <div className="flex items-center space-x-1">
          <HardDrive className="w-3 h-3" />
          <span>内存: {systemStats.memory.toFixed(1)}%</span>
        </div>

        {/* 上传流量 */}
        <div className="flex items-center space-x-1">
          <Upload className="w-3 h-3" />
          <span>↑ {formatBytes(systemStats.upload)}/s</span>
        </div>

        {/* 下载流量 */}
        <div className="flex items-center space-x-1">
          <Download className="w-3 h-3" />
          <span>↓ {formatBytes(systemStats.download)}/s</span>
        </div>
      </div>
    </div>
  )
}

export default StatusBar