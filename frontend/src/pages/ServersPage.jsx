import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Server, Plus } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import ServerCard from '../components/ServerCard'

/**
 * 服务器管理页面组件
 * 提供服务器的增删改查功能
 */
const ServersPage = () => {
  const { servers, addServer, updateServer, removeServer, proxyStatus, setProxyStatus, setActiveServer } = useAppStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingServer, setEditingServer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    protocol: 'vmess',
    address: '',
    port: '',
    id: '',
    alterId: '0',
    security: 'auto',
    network: 'tcp'
  })

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      protocol: 'vmess',
      address: '',
      port: '',
      id: '',
      alterId: '0',
      security: 'auto',
      network: 'tcp'
    })
    setShowAddForm(false)
    setEditingServer(null)
  }

  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingServer) {
      updateServer(editingServer.id, formData)
    } else {
      addServer({
        ...formData,
        id: Date.now().toString(),
        delay: Math.floor(Math.random() * 200) + 50
      })
    }
    resetForm()
  }

  // 开始编辑服务器
  const startEdit = (server) => {
    setFormData(server)
    setEditingServer(server)
    setShowAddForm(true)
  }

  // 删除服务器
  const handleDelete = (serverId) => {
    if (confirm('确定要删除这个服务器吗？')) {
      removeServer(serverId)
    }
  }

  // 复制服务器配置
  const handleCopy = (server) => {
    const config = `${server.protocol}://${server.address}:${server.port}`
    navigator.clipboard.writeText(config)
    // 这里可以添加一个toast提示
  }

  // 连接/断开服务器
  const handleConnect = (server) => {
    if (server) {
      // 连接到服务器
      setActiveServer(server)
      setProxyStatus('connecting')
      // 模拟连接过程
      setTimeout(() => {
        setProxyStatus('running')
      }, 2000)
    } else {
      // 断开连接
      setProxyStatus('stopped')
      setActiveServer(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Server className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">服务器管理</h1>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
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
                      <SelectItem value="shadowsocks">Shadowsocks</SelectItem>
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
                <div className="space-y-2">
                  <Label htmlFor="id">用户ID</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="输入用户ID"
                    required
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
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  取消
                </Button>
                <Button type="submit">
                  {editingServer ? '更新' : '添加'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 服务器列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {servers.map((server) => (
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

      {servers.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="text-center py-12">
            <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">暂无服务器</h3>
            <p className="text-sm text-muted-foreground mb-4">点击上方按钮添加您的第一个服务器</p>
            <Button onClick={() => setShowAddForm(true)}>
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