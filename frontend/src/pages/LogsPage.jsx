import React, { useState, useEffect, useRef } from 'react'
import { FileText, Download, Trash2, Search, Filter, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Switch } from '../components/ui/Switch'
import { Loading } from '../components/ui/Loading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import useAppStore from '../store/useAppStore'
import { GetLogLines } from '../../wailsjs/go/main/App'

/**
 * 日志页面组件
 * 提供日志查看、过滤、导出等功能
 */
const LogsPage = () => {
  const { logs, clearLogs, addLog } = useAppStore()
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [fileLogs, setFileLogs] = useState([])
  const logContainerRef = useRef(null)

  // 日志级别颜色映射
  const getLogLevelVariant = (level) => {
    switch (level) {
      case 'error': return 'destructive'
      case 'warn': return 'warning'
      case 'info': return 'info'
      case 'debug': return 'secondary'
      default: return 'secondary'
    }
  }

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
      const logLines = await GetLogLines(1000) // 读取最后1000行
      const parsedLogs = logLines
        .filter(line => line.trim()) // 过滤空行
        .map(parseLogLine)
        .filter(log => log.message.trim()) // 过滤空消息
      
      setFileLogs(parsedLogs)
    } catch (error) {
      console.error('Failed to load logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 合并store中的日志和文件中的日志
  const allLogs = [...fileLogs, ...logs]

  // 过滤日志
  const filteredLogs = allLogs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // 组件挂载时加载日志
  useEffect(() => {
    loadLogsFromFile()
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [allLogs, autoScroll])

  // 导出日志
  const handleExportLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.source ? `[${log.source}] ` : ''}${log.message}`
    ).join('\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gox-logs-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 清空日志
  const handleClearLogs = () => {
    if (confirm('确定要清空所有日志吗？此操作不可撤销。')) {
      clearLogs()
    }
  }

  return (
    <div className="p-6 space-y-6 pb-16">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">系统日志</h1>
          <Badge variant="secondary">{filteredLogs.length} 条记录</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="bg-theme hover:bg-theme/50 text-theme-foreground border-theme hover:border-theme/50 cursor-pointer"
            onClick={loadLogsFromFile} 
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button 
            variant="outline" 
            className="bg-theme hover:bg-theme/50 text-theme-foreground border-theme hover:border-theme/50 cursor-pointer"
            onClick={handleExportLogs} 
            disabled={filteredLogs.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button 
            variant="outline" 
            className="bg-theme hover:bg-theme/50 text-theme-foreground border-theme hover:border-theme/50 cursor-pointer"
            onClick={handleClearLogs} 
            disabled={logs.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清空
          </Button>
        </div>
      </div>

      {/* 过滤和搜索 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>日志过滤</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索日志内容..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有级别</SelectItem>
                  <SelectItem value="error">错误</SelectItem>
                  <SelectItem value="warn">警告</SelectItem>
                  <SelectItem value="info">信息</SelectItem>
                  <SelectItem value="debug">调试</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="autoScroll"
                checked={autoScroll}
                onCheckedChange={setAutoScroll}
              />
              <Label htmlFor="autoScroll" className="text-sm font-medium">
                自动滚动
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 日志内容 */}
      <Card>
        <CardHeader>
          <CardTitle>日志内容</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={logContainerRef}
            className="bg-muted/50 rounded-md p-4 h-96 overflow-auto font-mono text-sm space-y-1"
          >
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                {isLoading ? (
                  <Loading variant="dots" text="正在加载日志..." size="default" />
                ) : (
                  <div className="text-muted-foreground">
                    {allLogs.length === 0 ? '暂无日志记录' : '没有匹配的日志记录'}
                  </div>
                )}
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div key={index} className="flex items-start space-x-2 py-1 hover:bg-muted/30 rounded px-2">
                  <span className="text-muted-foreground text-xs whitespace-nowrap">
                    {log.timestamp}
                  </span>
                  <Badge variant={getLogLevelVariant(log.level)} className="text-xs">
                    {log.level.toUpperCase()}
                  </Badge>
                  {log.source && (
                    <span className="text-primary text-xs font-medium">
                      [{log.source}]
                    </span>
                  )}
                  <span className="flex-1 break-all">
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 日志统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['error', 'warn', 'info', 'debug'].map(level => {
          const count = allLogs.filter(log => log.level === level).length
          return (
            <Card key={level}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {level === 'error' ? '错误' :
                       level === 'warn' ? '警告' :
                       level === 'info' ? '信息' : '调试'}
                    </p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <Badge variant={getLogLevelVariant(level)}>
                    {level.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default LogsPage