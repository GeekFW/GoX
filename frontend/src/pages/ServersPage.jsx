import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useToast } from '../components/ui/Toast'
import { Server, Plus, Loader2 } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import ServerCard from '../components/ServerCard'

/**
 * 服务器管理页面组件
 * 提供服务器的增删改查功能
 */
const ServersPage = () => {
  const { 
    servers, 
    loadServers,
    addServer, 
    updateServer, 
    removeServer, 
    validateServerName,
    startProxy,
    stopProxy,
    refreshProxyStatus,
    proxyStatus, 
    activeServer
  } = useAppStore()
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingServer, setEditingServer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    protocol: 'vmess',
    address: '',
    port: '',
    // VMess 特有字段
    id: '',
    alterId: '0',
    security: 'auto',
    network: 'tcp',
    // VLESS 特有字段
    encryption: 'none',
    flow: '',
    // Trojan 特有字段
    password: '',
    sni: '',
    // 通用字段
    tls: false,
    skipCertVerify: false,
    serverName: ''
  })

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      protocol: 'vmess',
      address: '',
      port: '',
      // VMess 特有字段
      id: '',
      alterId: '0',
      security: 'auto',
      network: 'tcp',
      // VLESS 特有字段
      encryption: 'none',
      flow: '',
      // Trojan 特有字段
      password: '',
      sni: '',
      // 通用字段
      tls: false,
      skipCertVerify: false,
      serverName: ''
    })
    setShowAddForm(false)
    setEditingServer(null)
  }

  // 根据协议类型获取需要显示的字段
  const getProtocolFields = (protocol) => {
    const commonFields = ['name', 'address', 'port']
    
    switch (protocol) {
      case 'vmess':
        return [...commonFields, 'id', 'alterId', 'security', 'network', 'tls', 'skipCertVerify', 'serverName']
      case 'vless':
        return [...commonFields, 'id', 'encryption', 'flow', 'tls', 'skipCertVerify', 'serverName']
      case 'trojan':
        return [...commonFields, 'password', 'sni', 'skipCertVerify']
      default:
        return commonFields
    }
  }

  // 表单验证函数
  const validateForm = () => {
    const errors = []
    
    // 通用字段验证
    if (!formData.name.trim()) {
      errors.push('服务器名称不能为空')
    }
    if (!formData.address.trim()) {
      errors.push('服务器地址不能为空')
    }
    if (!formData.port || formData.port < 1 || formData.port > 65535) {
      errors.push('端口号必须在1-65535之间')
    }
    // 用户ID验证（trojan协议不需要用户ID）
    if (formData.protocol !== 'trojan' && !formData.id.trim()) {
      errors.push('用户ID不能为空')
    }
    
    // 协议特定验证
    switch (formData.protocol) {
      case 'vmess':
        if (formData.alterId < 0 || formData.alterId > 255) {
          errors.push('VMess alterId必须在0-255之间')
        }
        if (!formData.security) {
          errors.push('VMess加密方式不能为空')
        }
        break
      case 'vless':
        if (!formData.encryption) {
          errors.push('VLESS加密方式不能为空')
        }
        break
      case 'trojan':
        if (!formData.password.trim()) {
          errors.push('Trojan密码不能为空')
        }
        break
    }
    
    return errors
  }

  // 页面初始化
  useEffect(() => {
    const initPage = async () => {
      setLoading(true)
      try {
        await loadServers()
        await refreshProxyStatus()
      } catch (error) {
        console.error('Failed to initialize page:', error)
        toast.error('初始化失败', '无法加载服务器列表')
      } finally {
        setLoading(false)
      }
    }
    initPage()
  }, [])

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 表单验证
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast.error('表单验证失败', validationErrors.join('；'))
      return
    }

    setSubmitting(true)
    try {
      // 服务器名称重复校验
      const excludeID = editingServer ? editingServer.id : ''
      await validateServerName(formData.name, excludeID)
      
      if (editingServer) {
        await updateServer({
          ...formData,
          id: editingServer.id
        })
        toast.success('服务器更新成功', `${formData.name} 配置已更新`)
      } else {
        await addServer({
          ...formData,
          id: Date.now().toString()
        })
        toast.success('服务器添加成功', `${formData.name} 已添加到服务器列表`)
      }
      resetForm()
    } catch (error) {
      console.error('Submit error:', error)
      if (error.message && error.message.includes('重复')) {
        toast.error('服务器名称重复', '请使用不同的服务器名称')
      } else {
        toast.error(
          editingServer ? '更新失败' : '添加失败', 
          error.message || '操作失败，请重试'
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  // 开始编辑服务器
  const startEdit = (server) => {
    setFormData(server)
    setEditingServer(server)
    setShowAddForm(true)
  }

  // 删除服务器
  const handleDelete = async (serverId) => {
    const server = servers?.find(s => s.id === serverId)
    if (confirm('确定要删除这个服务器吗？')) {
      try {
        await removeServer(serverId)
        toast.success('服务器删除成功', `${server?.name || '服务器'} 已从列表中移除`)
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('删除失败', error.message || '删除服务器失败，请重试')
      }
    }
  }

  // 复制服务器配置
  const handleCopy = (server) => {
    const config = `${server.protocol}://${server.address}:${server.port}`
    navigator.clipboard.writeText(config)
    toast.success('配置已复制', '服务器配置已复制到剪贴板')
  }

  // 连接/断开服务器
  const handleConnect = async (server) => {
    try {
      if (server && proxyStatus !== 'running') {
        // 连接到服务器
        await startProxy(server)
        toast.success('代理启动成功', `已连接到 ${server.name}`)
      } else {
        // 断开连接
        await stopProxy()
        toast.success('代理已停止', '已断开代理连接')
      }
    } catch (error) {
      console.error('Connect error:', error)
      toast.error(
        server ? '连接失败' : '断开失败', 
        error.message || '操作失败，请重试'
      )
    }
  }

  return (
    <div className="p-6 space-y-6 pb-16">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Server className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">服务器管理</h1>
        </div>
        <Button 
          className="bg-theme hover:bg-theme/50 text-theme-foreground cursor-pointer"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          添加服务器
        </Button>
      </div>

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingServer ? '编辑服务器' : '添加新服务器'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 基础字段 */}
                <div className="space-y-2">
                  <Label htmlFor="name">服务器名称</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="输入服务器名称"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protocol">协议类型</Label>
                  <Select value={formData.protocol} onValueChange={(value) => setFormData({ ...formData, protocol: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vmess">VMess</SelectItem>
                      <SelectItem value="vless">VLESS</SelectItem>
                      <SelectItem value="trojan">Trojan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">服务器地址</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="输入服务器地址"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">端口</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    placeholder="输入端口号"
                    required
                  />
                </div>

                {/* VMess 协议特有字段 */}
                {formData.protocol === 'vmess' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="id">用户ID (UUID)</Label>
                      <Input
                        id="id"
                        value={formData.id}
                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                        placeholder="输入用户ID"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alterId">额外ID</Label>
                      <Input
                        id="alterId"
                        type="number"
                        value={formData.alterId}
                        onChange={(e) => setFormData({ ...formData, alterId: e.target.value })}
                        placeholder="通常为0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="security">加密方式</Label>
                      <Select value={formData.security} onValueChange={(value) => setFormData({ ...formData, security: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">auto</SelectItem>
                          <SelectItem value="aes-128-gcm">aes-128-gcm</SelectItem>
                          <SelectItem value="chacha20-poly1305">chacha20-poly1305</SelectItem>
                          <SelectItem value="none">none</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="network">传输协议</Label>
                      <Select value={formData.network} onValueChange={(value) => setFormData({ ...formData, network: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tcp">TCP</SelectItem>
                          <SelectItem value="ws">WebSocket</SelectItem>
                          <SelectItem value="h2">HTTP/2</SelectItem>
                          <SelectItem value="grpc">gRPC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* VLESS 协议特有字段 */}
                {formData.protocol === 'vless' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="id">用户ID (UUID)</Label>
                      <Input
                        id="id"
                        value={formData.id}
                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                        placeholder="输入用户ID"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="encryption">加密方式</Label>
                      <Select value={formData.encryption} onValueChange={(value) => setFormData({ ...formData, encryption: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">none</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="flow">流控模式</Label>
                      <Select value={formData.flow} onValueChange={(value) => setFormData({ ...formData, flow: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择流控模式" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">无</SelectItem>
                          <SelectItem value="xtls-rprx-vision">xtls-rprx-vision</SelectItem>
                          <SelectItem value="xtls-rprx-direct">xtls-rprx-direct</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Trojan 协议特有字段 */}
                {formData.protocol === 'trojan' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password">密码</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="输入Trojan密码"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sni">SNI</Label>
                      <Input
                        id="sni"
                        value={formData.sni}
                        onChange={(e) => setFormData({ ...formData, sni: e.target.value })}
                        placeholder="输入SNI域名"
                      />
                    </div>
                  </>
                )}

                {/* 通用TLS字段 */}
                {(formData.protocol === 'vmess' || formData.protocol === 'vless') && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="tls">启用TLS</Label>
                      <Select value={formData.tls.toString()} onValueChange={(value) => setFormData({ ...formData, tls: value === 'true' })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">否</SelectItem>
                          <SelectItem value="true">是</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.tls && (
                      <div className="space-y-2">
                        <Label htmlFor="serverName">服务器名称 (SNI)</Label>
                        <Input
                          id="serverName"
                          value={formData.serverName}
                          onChange={(e) => setFormData({ ...formData, serverName: e.target.value })}
                          placeholder="输入TLS服务器名称"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* 跳过证书验证字段 */}
                <div className="space-y-2">
                  <Label htmlFor="skipCertVerify">跳过证书验证</Label>
                  <Select value={formData.skipCertVerify.toString()} onValueChange={(value) => setFormData({ ...formData, skipCertVerify: value === 'true' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">否</SelectItem>
                      <SelectItem value="true">是</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="bg-theme hover:bg-theme/50 text-theme-foreground border-theme hover:border-theme/50 cursor-pointer"
                  onClick={resetForm}
                >
                  取消
                </Button>
                <Button 
                  type="submit"
                  disabled={submitting}
                  className="bg-theme hover:bg-theme/50 text-theme-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingServer ? '更新中...' : '添加中...'}
                    </>
                  ) : (
                    editingServer ? '更新' : '添加'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 服务器列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {servers && servers.map((server) => (
          <ServerCard
             key={server.id}
             server={server}
             onEdit={startEdit}
             onDelete={handleDelete}
             onCopy={handleCopy}
             onConnect={handleConnect}
           />
        ))}
      </div>

      {(!servers || servers.length === 0) && !showAddForm && (
        <Card>
          <CardContent className="text-center py-12">
            <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">暂无服务器</h3>
            <p className="text-sm text-muted-foreground mb-4">点击上方按钮添加您的第一个服务器</p>
            <Button 
              className="bg-theme hover:bg-theme/50 text-theme-foreground cursor-pointer"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              添加服务器
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ServersPage