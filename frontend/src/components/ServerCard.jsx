import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Copy, Edit, Trash2, Play, Pause, Wifi, WifiOff } from 'lucide-react'
import useAppStore from '../store/useAppStore'

/**
 * 服务器卡片组件
 * @param {Object} server - 服务器信息
 * @param {Function} onEdit - 编辑回调
 * @param {Function} onDelete - 删除回调
 * @param {Function} onCopy - 复制回调
 * @param {Function} onConnect - 连接回调
 */
const ServerCard = ({ server, onEdit, onDelete, onCopy, onConnect }) => {
  const { proxyStatus, activeServer } = useAppStore()
  
  // 判断是否为当前活跃服务器
  const isActive = activeServer?.id === server.id
  
  // 获取协议对应的Badge颜色
  const getProtocolVariant = (protocol) => {
    switch (protocol) {
      case 'vmess': return 'info'
      case 'vless': return 'success'
      case 'trojan': return 'warning'
      case 'shadowsocks': return 'secondary'
      default: return 'default'
    }
  }
  
  // 获取TLS状态显示
  const getTLSStatus = (tls) => {
    return tls ? 'TLS' : '无加密'
  }
  
  // 处理连接/断开
  const handleConnect = () => {
    if (isActive && proxyStatus === 'running') {
      // 断开连接
      onConnect(null)
    } else {
      // 连接到此服务器
      onConnect(server)
    }
  }
  
  return (
    <Card className={`relative transition-all duration-200 ${
      isActive ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
    }`}>
      {/* 活跃状态指示器 */}
      {isActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            {isActive && proxyStatus === 'running' ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-muted-foreground" />
            )}
            <span>{server.name}</span>
          </CardTitle>
          <Badge variant={getProtocolVariant(server.protocol)}>
            {server.protocol.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* 服务器信息 */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">地址:</span>
            <span className="font-mono text-right">{server.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">端口:</span>
            <span className="font-mono">{server.port}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">传输:</span>
            <span className="font-mono text-xs">{getTLSStatus(server.tls)}</span>
          </div>
          {server.protocol === 'vmess' && server.security && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">加密:</span>
              <span className="font-mono text-xs">{server.security}</span>
            </div>
          )}
          {server.protocol === 'vless' && server.flow && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">流控:</span>
              <span className="font-mono text-xs">{server.flow}</span>
            </div>
          )}
          {server.protocol === 'trojan' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">SNI:</span>
              <span className="font-mono text-xs">{server.sni || '未设置'}</span>
            </div>
          )}
        </div>
        
        {/* 操作按钮 */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex space-x-1">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onCopy(server)}
              title="复制配置"
              className="cursor-pointer"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onEdit(server)}
              title="编辑服务器"
              className="cursor-pointer"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDelete(server.id)}
              title="删除服务器"
              className="text-destructive hover:text-destructive cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          
          <Button 
            size="sm" 
            variant={isActive && proxyStatus === 'running' ? 'destructive' : 'default'}
            onClick={handleConnect}
            disabled={proxyStatus === 'connecting'}
            className="cursor-pointer min-w-[60px]"
          >
            {proxyStatus === 'connecting' && isActive ? (
              <>连接中...</>
            ) : isActive && proxyStatus === 'running' ? (
              <><Pause className="w-3 h-3 mr-1" />断开</>
            ) : (
              <><Play className="w-3 h-3 mr-1" />连接</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ServerCard