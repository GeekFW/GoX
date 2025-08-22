package server

import "time"

// ServerConfig 服务器配置结构体
type ServerConfig struct {
	ID       string    `json:"id"`       // 服务器唯一标识
	Name     string    `json:"name"`     // 服务器名称
	Protocol string    `json:"protocol"` // 协议类型 (vmess, vless, trojan, shadowsocks)
	Address  string    `json:"address"`  // 服务器地址
	Port     int       `json:"port"`     // 服务器端口
	UUID     string    `json:"uuid"`     // UUID (vmess/vless)
	Password string    `json:"password"` // 密码 (trojan/shadowsocks)
	Method   string    `json:"method"`   // 加密方法 (shadowsocks)
	Network  string    `json:"network"`  // 传输协议 (tcp, ws, grpc)
	Path     string    `json:"path"`     // 路径 (websocket)
	Host     string    `json:"host"`     // 主机名 (websocket)
	TLS      bool      `json:"tls"`      // 是否启用TLS
	SNI      string    `json:"sni"`      // SNI
	Created  time.Time `json:"created"`  // 创建时间
	Updated  time.Time `json:"updated"`  // 更新时间
}

// ServerManager 服务器管理器接口
type ServerManager interface {
	// CreateServer 创建新服务器配置
	CreateServer(config *ServerConfig) error
	// AddServer 添加新服务器配置
	AddServer(config *ServerConfig) error
	// GetServer 根据ID获取服务器配置
	GetServer(id string) (*ServerConfig, error)
	// UpdateServer 更新服务器配置
	UpdateServer(config *ServerConfig) error
	// DeleteServer 删除服务器配置
	DeleteServer(id string) error
	// RemoveServer 删除服务器配置（按名称）
	RemoveServer(name string) error
	// ListServers 列出所有服务器配置
	ListServers() ([]*ServerConfig, error)
	// ValidateServerName 验证服务器名称是否重复
	ValidateServerName(name string, excludeID string) error
}