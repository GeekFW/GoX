package config

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"

	"Gox/constants"
)

// LogConfig 日志配置结构
type LogConfig struct {
	Level   string `json:"level"`   // debug, info, warn, error
	Enabled bool   `json:"enabled"` // 是否启用日志
	Path    string `json:"path"`    // 日志路径
}

// ProxyConfig 代理配置结构
type ProxyConfig struct {
	XrayBinaryPath string `json:"xrayBinaryPath"` // Xray二进制路径
	XrayConfig     string `json:"xrayConfig"`     // Xray配置
	RouteMode      string `json:"routeMode"`      // AsIs, GeoIP
	GeoIPPath      string `json:"geoIPPath"`      // GeoIP文件路径
}

// TUNConfig TUN配置结构
type TUNConfig struct {
	DeviceName string `json:"deviceName"` // TUN设备名称
	IPAddress  string `json:"ipAddress"`  // TUN IP地址
	Subnet     string `json:"subnet"`     // TUN网段
}

// Config 应用程序配置结构
type Config struct {
	// 基础设置
	Theme      string `json:"theme"`      // light, dark
	ThemeColor string `json:"themeColor"` // 主题色
	Language   string `json:"language"`   // 语言设置

	// 模块配置
	Log   LogConfig   `json:"log"`   // 日志配置
	Proxy ProxyConfig `json:"proxy"` // 代理配置
	TUN   TUNConfig   `json:"tun"`   // TUN配置

	// 服务器列表
	Servers []ServerConfig `json:"servers"`
}

// ServerConfig 服务器配置
type ServerConfig struct {
	ID       string `json:"id"`       // 服务器ID
	Name     string `json:"name"`     // 服务器名称
	Protocol string `json:"protocol"` // vmess, vless, trojan
	Address  string `json:"address"`  // 服务器地址
	Port     int    `json:"port"`     // 端口
	Config   string `json:"config"`   // 协议配置JSON
	Enabled  bool   `json:"enabled"`  // 是否启用
}

var (
	globalConfig *Config
	configMutex  sync.RWMutex
)

// GetDefaultConfig 获取默认配置
func GetDefaultConfig() *Config {
	return &Config{
		Theme:      "dark",
		ThemeColor: "blue",
		Language:   "zh-CN",
		Log: LogConfig{
			Level:   "info",
			Enabled: true,
			Path:    constants.GetLogDir(),
		},
		Proxy: ProxyConfig{
			XrayBinaryPath: "",
			XrayConfig:     "",
			RouteMode:      "AsIs",
			GeoIPPath:      "",
		},
		TUN: TUNConfig{
			DeviceName: "tun0",
			IPAddress:  "10.0.0.1",
			Subnet:     "10.0.0.0/24",
		},
		Servers: []ServerConfig{},
	}
}

// LoadConfig 加载配置文件
func LoadConfig() (*Config, error) {
	configMutex.Lock()
	defer configMutex.Unlock()

	if globalConfig != nil {
		return globalConfig, nil
	}

	configPath := constants.GetConfigFilePath()
	data, err := os.ReadFile(configPath)
	if err != nil {
		if os.IsNotExist(err) {
			// 配置文件不存在，使用默认配置并保存
			globalConfig = GetDefaultConfig()
			if saveErr := saveConfigInternal(globalConfig, false); saveErr != nil {
				return nil, fmt.Errorf("failed to save default config: %w", saveErr)
			}
			return globalConfig, nil
		}
		return nil, err
	}

	// 尝试解析为新格式
	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	// 检查是否需要迁移（检查是否存在旧字段）
	var rawConfig map[string]interface{}
	if err := json.Unmarshal(data, &rawConfig); err == nil {
		if needsMigration(rawConfig) {
			config = migrateConfig(rawConfig)
			// 保存迁移后的配置
			if saveErr := saveConfigInternal(&config, false); saveErr != nil {
				return nil, fmt.Errorf("failed to save migrated config: %w", saveErr)
			}
		}
	}

	globalConfig = &config
	return globalConfig, nil
}

// SaveConfig 保存配置文件
func SaveConfig(config *Config) error {
	return saveConfigInternal(config, true)
}

// saveConfigInternal 内部保存配置文件函数
func saveConfigInternal(config *Config, needLock bool) error {
	if needLock {
		configMutex.Lock()
		defer configMutex.Unlock()
	}

	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	configPath := constants.GetConfigFilePath()
	return os.WriteFile(configPath, data, 0644)
}

// GetConfig 获取当前配置
func GetConfig() *Config {
	configMutex.RLock()
	defer configMutex.RUnlock()
	return globalConfig
}

// UpdateConfig 更新配置
func UpdateConfig(config *Config) error {
	configMutex.Lock()
	globalConfig = config
	configMutex.Unlock()
	return SaveConfig(config)
}

// needsMigration 检查配置是否需要迁移
func needsMigration(rawConfig map[string]interface{}) bool {
	// 检查是否存在旧字段
	oldFields := []string{"logLevel", "logEnabled", "logPath", "xrayBinaryPath", "xrayConfig", "routeMode", "geoIPPath", "tunDeviceName", "tunIPAddress", "tunSubnet"}
	for _, field := range oldFields {
		if _, exists := rawConfig[field]; exists {
			return true
		}
	}
	return false
}

// migrateConfig 迁移旧格式配置到新格式
func migrateConfig(rawConfig map[string]interface{}) Config {
	config := GetDefaultConfig()

	// 迁移基础设置
	if theme, ok := rawConfig["theme"].(string); ok {
		config.Theme = theme
	}
	if themeColor, ok := rawConfig["themeColor"].(string); ok {
		config.ThemeColor = themeColor
	}
	if language, ok := rawConfig["language"].(string); ok {
		config.Language = language
	}

	// 迁移日志设置
	if logLevel, ok := rawConfig["logLevel"].(string); ok {
		config.Log.Level = logLevel
	}
	if logEnabled, ok := rawConfig["logEnabled"].(bool); ok {
		config.Log.Enabled = logEnabled
	}
	if logPath, ok := rawConfig["logPath"].(string); ok {
		config.Log.Path = logPath
	}

	// 迁移代理设置
	if xrayBinaryPath, ok := rawConfig["xrayBinaryPath"].(string); ok {
		config.Proxy.XrayBinaryPath = xrayBinaryPath
	}
	if xrayConfig, ok := rawConfig["xrayConfig"].(string); ok {
		config.Proxy.XrayConfig = xrayConfig
	}
	if routeMode, ok := rawConfig["routeMode"].(string); ok {
		config.Proxy.RouteMode = routeMode
	}
	if geoIPPath, ok := rawConfig["geoIPPath"].(string); ok {
		config.Proxy.GeoIPPath = geoIPPath
	}

	// 迁移TUN设置
	if tunDeviceName, ok := rawConfig["tunDeviceName"].(string); ok {
		config.TUN.DeviceName = tunDeviceName
	}
	if tunIPAddress, ok := rawConfig["tunIPAddress"].(string); ok {
		config.TUN.IPAddress = tunIPAddress
	}
	if tunSubnet, ok := rawConfig["tunSubnet"].(string); ok {
		config.TUN.Subnet = tunSubnet
	}

	// 迁移服务器列表
	if servers, ok := rawConfig["servers"].([]interface{}); ok {
		for _, serverData := range servers {
			if serverMap, ok := serverData.(map[string]interface{}); ok {
				server := ServerConfig{}
				if id, ok := serverMap["id"].(string); ok {
					server.ID = id
				}
				if name, ok := serverMap["name"].(string); ok {
					server.Name = name
				}
				if protocol, ok := serverMap["protocol"].(string); ok {
					server.Protocol = protocol
				}
				if address, ok := serverMap["address"].(string); ok {
					server.Address = address
				}
				if port, ok := serverMap["port"].(float64); ok {
					server.Port = int(port)
				}
				if configStr, ok := serverMap["config"].(string); ok {
					server.Config = configStr
				}
				if enabled, ok := serverMap["enabled"].(bool); ok {
					server.Enabled = enabled
				}
				config.Servers = append(config.Servers, server)
			}
		}
	}

	return *config
}
