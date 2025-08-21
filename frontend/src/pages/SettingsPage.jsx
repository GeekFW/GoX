import React, { useState } from 'react'
import { Settings, Palette, Globe, Network, Info, Save, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import useAppStore from '../store/useAppStore'

/**
 * 设置页面组件
 * 提供应用的各种配置选项
 */
const SettingsPage = () => {
  const { theme, toggleTheme } = useAppStore()
  const [settings, setSettings] = useState({
    // 通用设置
    language: 'zh-CN',
    autoStart: false,
    minimizeToTray: true,
    checkUpdates: true,
    
    // 代理设置
    httpPort: '7890',
    socksPort: '7891',
    mixedPort: '7892',
    allowLan: false,
    
    // 网络设置
    dnsServer: '8.8.8.8',
    timeout: '5000',
    retries: '3',
    
    // 路由设置
    routeMode: 'rule',
    bypassChina: true,
    bypassPrivate: true
  })

  // 更新设置
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // 保存设置
  const handleSave = () => {
    // 这里应该调用后端API保存设置
    console.log('保存设置:', settings)
    // 可以添加一个toast提示
  }

  // 重置设置
  const handleReset = () => {
    if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
      setSettings({
        language: 'zh-CN',
        autoStart: false,
        minimizeToTray: true,
        checkUpdates: true,
        httpPort: '7890',
        socksPort: '7891',
        mixedPort: '7892',
        allowLan: false,
        dnsServer: '8.8.8.8',
        timeout: '5000',
        retries: '3',
        routeMode: 'rule',
        bypassChina: true,
        bypassPrivate: true
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">设置</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      {/* 设置选项卡 */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>通用</span>
          </TabsTrigger>
          <TabsTrigger value="proxy" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>代理</span>
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center space-x-2">
            <Network className="w-4 h-4" />
            <span>网络</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center space-x-2">
            <Info className="w-4 h-4" />
            <span>关于</span>
          </TabsTrigger>
        </TabsList>

        {/* 通用设置 */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>界面设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">主题</Label>
                  <Select value={theme} onValueChange={toggleTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">浅色</SelectItem>
                      <SelectItem value="dark">深色</SelectItem>
                      <SelectItem value="system">跟随系统</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">语言</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-CN">简体中文</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>启动设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoStart">开机自启动</Label>
                  <p className="text-sm text-muted-foreground">系统启动时自动运行应用</p>
                </div>
                <input
                  type="checkbox"
                  id="autoStart"
                  checked={settings.autoStart}
                  onChange={(e) => updateSetting('autoStart', e.target.checked)}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="minimizeToTray">最小化到系统托盘</Label>
                  <p className="text-sm text-muted-foreground">关闭窗口时最小化到系统托盘</p>
                </div>
                <input
                  type="checkbox"
                  id="minimizeToTray"
                  checked={settings.minimizeToTray}
                  onChange={(e) => updateSetting('minimizeToTray', e.target.checked)}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="checkUpdates">自动检查更新</Label>
                  <p className="text-sm text-muted-foreground">启动时检查应用更新</p>
                </div>
                <input
                  type="checkbox"
                  id="checkUpdates"
                  checked={settings.checkUpdates}
                  onChange={(e) => updateSetting('checkUpdates', e.target.checked)}
                  className="rounded"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 代理设置 */}
        <TabsContent value="proxy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>端口配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="httpPort">HTTP 端口</Label>
                  <Input
                    id="httpPort"
                    type="number"
                    value={settings.httpPort}
                    onChange={(e) => updateSetting('httpPort', e.target.value)}
                    placeholder="7890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="socksPort">SOCKS 端口</Label>
                  <Input
                    id="socksPort"
                    type="number"
                    value={settings.socksPort}
                    onChange={(e) => updateSetting('socksPort', e.target.value)}
                    placeholder="7891"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mixedPort">混合端口</Label>
                  <Input
                    id="mixedPort"
                    type="number"
                    value={settings.mixedPort}
                    onChange={(e) => updateSetting('mixedPort', e.target.value)}
                    placeholder="7892"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowLan">允许局域网连接</Label>
                  <p className="text-sm text-muted-foreground">允许其他设备通过局域网连接代理</p>
                </div>
                <input
                  type="checkbox"
                  id="allowLan"
                  checked={settings.allowLan}
                  onChange={(e) => updateSetting('allowLan', e.target.checked)}
                  className="rounded"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>路由设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="routeMode">路由模式</Label>
                <Select value={settings.routeMode} onValueChange={(value) => updateSetting('routeMode', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">全局代理</SelectItem>
                    <SelectItem value="rule">规则代理</SelectItem>
                    <SelectItem value="direct">直连模式</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="bypassChina">绕过中国大陆</Label>
                  <p className="text-sm text-muted-foreground">中国大陆网站直连</p>
                </div>
                <input
                  type="checkbox"
                  id="bypassChina"
                  checked={settings.bypassChina}
                  onChange={(e) => updateSetting('bypassChina', e.target.checked)}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="bypassPrivate">绕过私有网络</Label>
                  <p className="text-sm text-muted-foreground">局域网地址直连</p>
                </div>
                <input
                  type="checkbox"
                  id="bypassPrivate"
                  checked={settings.bypassPrivate}
                  onChange={(e) => updateSetting('bypassPrivate', e.target.checked)}
                  className="rounded"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 网络设置 */}
        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DNS 设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dnsServer">DNS 服务器</Label>
                <Input
                  id="dnsServer"
                  value={settings.dnsServer}
                  onChange={(e) => updateSetting('dnsServer', e.target.value)}
                  placeholder="8.8.8.8"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>连接设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeout">连接超时 (毫秒)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={settings.timeout}
                    onChange={(e) => updateSetting('timeout', e.target.value)}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retries">重试次数</Label>
                  <Input
                    id="retries"
                    type="number"
                    value={settings.retries}
                    onChange={(e) => updateSetting('retries', e.target.value)}
                    placeholder="3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 关于 */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>应用信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary rounded-lg mx-auto flex items-center justify-center">
                  <Settings className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">GoX Client</h3>
                  <p className="text-muted-foreground">版本 1.0.0</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>一个现代化的代理客户端</p>
                  <p>基于 Wails 和 React 构建</p>
                </div>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline">检查更新</Button>
                  <Button variant="outline">查看日志</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>开源许可</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>本软件基于 MIT 许可证开源</p>
                <p>© 2024 GoX Client. All rights reserved.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsPage