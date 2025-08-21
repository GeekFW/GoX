package constants

import (
	"os"
	"path/filepath"
)

const (
	// AppName 应用程序名称
	AppName = "gox-client"
	// ConfigFileName 配置文件名称
	ConfigFileName = "config.json"
	// LogFileName 日志文件名称
	LogFileName = "app.log"
)

var (
	// AppDir 应用程序运行目录
	AppDir string
	// ConfigDir 配置文件目录
	ConfigDir string
	// LogDir 日志文件目录
	LogDir string
	// ConfigFilePath 配置文件完整路径
	ConfigFilePath string
	// LogFilePath 日志文件完整路径
	LogFilePath string
)

// InitRuntimePaths 初始化运行时路径
func InitRuntimePaths() error {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	// 设置应用程序目录
	AppDir = filepath.Join(homeDir, "."+AppName)
	ConfigDir = filepath.Join(AppDir, "config")
	LogDir = filepath.Join(AppDir, "logs")

	// 设置文件路径
	ConfigFilePath = filepath.Join(ConfigDir, ConfigFileName)
	LogFilePath = filepath.Join(LogDir, LogFileName)

	// 创建必要的目录
	if err := os.MkdirAll(ConfigDir, 0755); err != nil {
		return err
	}
	if err := os.MkdirAll(LogDir, 0755); err != nil {
		return err
	}

	return nil
}

// GetAppDir 获取应用程序目录
func GetAppDir() string {
	return AppDir
}

// GetConfigDir 获取配置目录
func GetConfigDir() string {
	return ConfigDir
}

// GetLogDir 获取日志目录
func GetLogDir() string {
	return LogDir
}

// GetConfigFilePath 获取配置文件路径
func GetConfigFilePath() string {
	return ConfigFilePath
}

// GetLogFilePath 获取日志文件路径
func GetLogFilePath() string {
	return LogFilePath
}