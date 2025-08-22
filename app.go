package main

import (
	"context"
	"fmt"

	"Gox/config"
	"Gox/constants"
	"Gox/logger"
	"Gox/proxy"
	"Gox/server"
)

// App 应用程序结构体
type App struct {
	ctx           context.Context
	serverManager server.ServerManager
	proxyManager  proxy.ProxyManager
}

// NewApp 创建新的应用程序实例
func NewApp() *App {
	return &App{}
}

// startup 应用程序启动时调用
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// 初始化运行时路径
	if err := constants.InitRuntimePaths(); err != nil {
		fmt.Printf("Failed to initialize runtime paths: %v\n", err)
		return
	}

	// 加载配置
	cfg, err := config.LoadConfig()
	if err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		return
	}

	// 初始化日志系统
	if err := logger.InitLogger(cfg.Log.Level, cfg.Log.Enabled); err != nil {
		fmt.Printf("Failed to initialize logger: %v\n", err)
		return
	}

	// 初始化服务器管理器
	a.serverManager = server.NewFileServerManager(constants.GetServerDir())
	// 初始化代理管理器
	proxyMgr, err := proxy.NewXrayProxyManager(constants.GetAppDir(), XrayBinary)
	if err != nil {
		fmt.Printf("Failed to initialize proxy manager: %v\n", err)
		return
	}
	a.proxyManager = proxyMgr

	logger.GetSugarLogger().Info("Application started successfully")
}

// Greet 问候方法
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// GetConfig 获取应用程序配置
func (a *App) GetConfig() *config.Config {
	return config.GetConfig()
}

// UpdateConfig 更新应用程序配置
func (a *App) UpdateConfig(cfg *config.Config) error {
	return config.UpdateConfig(cfg)
}

// GetLogLines 获取日志行
func (a *App) GetLogLines(lines int) ([]string, error) {
	return logger.ReadLogFile(lines)
}

// ListServers 获取所有服务器配置
func (a *App) ListServers() ([]*server.ServerConfig, error) {
	return a.serverManager.ListServers()
}

// AddServer 添加新服务器
func (a *App) AddServer(config *server.ServerConfig) error {
	return a.serverManager.AddServer(config)
}

// UpdateServer 更新服务器配置
func (a *App) UpdateServer(config *server.ServerConfig) error {
	return a.serverManager.UpdateServer(config)
}

// RemoveServer 删除服务器
func (a *App) RemoveServer(name string) error {
	return a.serverManager.RemoveServer(name)
}

// ValidateServerName 验证服务器名称是否重复
func (a *App) ValidateServerName(name string, excludeID string) error {
	return a.serverManager.ValidateServerName(name, excludeID)
}

// StartProxy 启动代理
func (a *App) StartProxy(serverName string) error {
	// 获取服务器配置
	serverConfig, err := a.serverManager.GetServer(serverName)
	if err != nil {
		return err
	}
	
	// 启动代理
	return a.proxyManager.Start(serverConfig)
}

// StopProxy 停止代理
func (a *App) StopProxy() error {
	return a.proxyManager.Stop()
}

// GetProxyStatus 获取代理状态
func (a *App) GetProxyStatus() proxy.ProxyStatus {
	return a.proxyManager.GetStatus()
}
