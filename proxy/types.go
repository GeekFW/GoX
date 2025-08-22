package proxy

import (
	"Gox/server"
	"context"
)

// ProxyStatus 代理状态
type ProxyStatus string

const (
	StatusStopped    ProxyStatus = "stopped"    // 已停止
	StatusConnecting ProxyStatus = "connecting" // 连接中
	StatusRunning    ProxyStatus = "running"    // 运行中
	StatusError      ProxyStatus = "error"      // 错误
)

// ProxyManager 代理管理器接口
type ProxyManager interface {
	// StartProxy 启动代理
	StartProxy(ctx context.Context, config *server.ServerConfig) error
	// Start 启动代理（简化版本）
	Start(config *server.ServerConfig) error
	// StopProxy 停止代理
	StopProxy() error
	// Stop 停止代理（简化版本）
	Stop() error
	// GetStatus 获取代理状态
	GetStatus() ProxyStatus
	// GetActiveServer 获取当前活动的服务器配置
	GetActiveServer() *server.ServerConfig
	// IsRunning 检查代理是否正在运行
	IsRunning() bool
}

// XrayConfig Xray配置结构体
type XrayConfig struct {
	Log       LogConfig       `json:"log"`
	Inbounds  []InboundConfig `json:"inbounds"`
	Outbounds []OutboundConfig `json:"outbounds"`
	Routing   RoutingConfig   `json:"routing"`
}

// LogConfig 日志配置
type LogConfig struct {
	LogLevel string `json:"loglevel"`
}

// InboundConfig 入站配置
type InboundConfig struct {
	Tag      string                 `json:"tag"`
	Port     int                    `json:"port"`
	Protocol string                 `json:"protocol"`
	Settings map[string]interface{} `json:"settings,omitempty"`
	Sniffing *SniffingConfig        `json:"sniffing,omitempty"`
}

// OutboundConfig 出站配置
type OutboundConfig struct {
	Tag           string                 `json:"tag"`
	Protocol      string                 `json:"protocol"`
	Settings      map[string]interface{} `json:"settings,omitempty"`
	StreamSettings *StreamSettings       `json:"streamSettings,omitempty"`
}

// SniffingConfig 流量探测配置
type SniffingConfig struct {
	Enabled      bool     `json:"enabled"`
	DestOverride []string `json:"destOverride"`
}

// StreamSettings 传输配置
type StreamSettings struct {
	Network    string                 `json:"network"`
	Security   string                 `json:"security,omitempty"`
	TLSSettings map[string]interface{} `json:"tlsSettings,omitempty"`
	WSSettings  map[string]interface{} `json:"wsSettings,omitempty"`
	TCPSettings map[string]interface{} `json:"tcpSettings,omitempty"`
}

// RoutingConfig 路由配置
type RoutingConfig struct {
	DomainStrategy string      `json:"domainStrategy"`
	Rules          []RuleConfig `json:"rules"`
}

// RuleConfig 路由规则配置
type RuleConfig struct {
	Type        string   `json:"type"`
	OutboundTag string   `json:"outboundTag"`
	Domain      []string `json:"domain,omitempty"`
	IP          []string `json:"ip,omitempty"`
}