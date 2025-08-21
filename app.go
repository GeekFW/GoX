package main

import (
	"context"
	"fmt"

	"Gox/config"
	"Gox/constants"
	"Gox/logger"
)

// App 应用程序结构体
type App struct {
	ctx context.Context
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
