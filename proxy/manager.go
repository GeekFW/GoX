package proxy

import (
	"Gox/server"
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"time"
)

// XrayProxyManager Xray代理管理器
type XrayProxyManager struct {
	mu           sync.RWMutex
	status       ProxyStatus
	activeServer *server.ServerConfig
	cmd          *exec.Cmd
	cancel       context.CancelFunc
	xrayPath     string
	configPath   string
}

// NewXrayProxyManager 创建新的Xray代理管理器
func NewXrayProxyManager(workDir string, xrayBinary embed.FS) (*XrayProxyManager, error) {
	xrayPath := filepath.Join(workDir, "xray.exe")
	configPath := filepath.Join(workDir, "xray_config.json")

	// 提取嵌入的xray.exe到工作目录
	if err := extractXrayBinary(xrayPath, xrayBinary); err != nil {
		return nil, fmt.Errorf("failed to extract xray binary: %w", err)
	}

	return &XrayProxyManager{
		status:     StatusStopped,
		xrayPath:   xrayPath,
		configPath: configPath,
	}, nil
}

// extractXrayBinary 提取嵌入的xray.exe到指定路径
func extractXrayBinary(targetPath string, xrayBinary embed.FS) error {
	// 检查文件是否已存在且是最新的
	if _, err := os.Stat(targetPath); err == nil {
		// 文件已存在，可以选择跳过或覆盖
		// 这里选择跳过以提高性能
		return nil
	}

	// 从embed.FS读取xray.exe
	data, err := xrayBinary.ReadFile("resources/xray.exe")
	if err != nil {
		return fmt.Errorf("failed to read embedded xray binary: %w", err)
	}

	// 确保目标目录存在
	dir := filepath.Dir(targetPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// 写入文件
	if err := os.WriteFile(targetPath, data, 0755); err != nil {
		return fmt.Errorf("failed to write xray binary: %w", err)
	}

	return nil
}

// StartProxy 启动代理
func (m *XrayProxyManager) StartProxy(ctx context.Context, config *server.ServerConfig) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	// 如果已经在运行，先停止
	if m.status == StatusRunning {
		if err := m.stopProxyInternal(); err != nil {
			return fmt.Errorf("failed to stop existing proxy: %w", err)
		}
	}

	m.status = StatusConnecting
	m.activeServer = config

	// 生成Xray配置文件
	xrayConfig := m.generateXrayConfig(config)
	if err := m.saveXrayConfig(xrayConfig); err != nil {
		return fmt.Errorf("failed to save xray config: %w", err)
	}

	// 创建上下文和取消函数
	ctx, cancel := context.WithCancel(ctx)
	m.cancel = cancel

	// 启动Xray进程
	m.cmd = exec.CommandContext(ctx, m.xrayPath, "-config", m.configPath)
	m.cmd.Stdout = os.Stdout
	m.cmd.Stderr = os.Stderr

	if err := m.cmd.Start(); err != nil {
		m.status = StatusError
		return fmt.Errorf("failed to start xray process: %w", err)
	}

	// 启动监控goroutine
	go m.monitorProcess()

	// 等待一段时间确认启动成功
	time.Sleep(2 * time.Second)
	if m.cmd.Process == nil || m.cmd.ProcessState != nil {
		m.status = StatusError
		return fmt.Errorf("xray process failed to start or exited immediately")
	}

	m.status = StatusRunning
	return nil
}

// StopProxy 停止代理
func (m *XrayProxyManager) StopProxy() error {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.stopProxyInternal()
}

// Start 启动代理（简化版本）
func (m *XrayProxyManager) Start(config *server.ServerConfig) error {
	return m.StartProxy(context.Background(), config)
}

// Stop 停止代理（简化版本）
func (m *XrayProxyManager) Stop() error {
	return m.StopProxy()
}

// stopProxyInternal 内部停止代理方法（不加锁）
func (m *XrayProxyManager) stopProxyInternal() error {
	if m.cancel != nil {
		m.cancel()
		m.cancel = nil
	}

	if m.cmd != nil && m.cmd.Process != nil {
		if err := m.cmd.Process.Kill(); err != nil {
			return fmt.Errorf("failed to kill xray process: %w", err)
		}
		m.cmd = nil
	}

	m.status = StatusStopped
	m.activeServer = nil
	return nil
}

// GetStatus 获取代理状态
func (m *XrayProxyManager) GetStatus() ProxyStatus {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.status
}

// GetActiveServer 获取当前活动的服务器配置
func (m *XrayProxyManager) GetActiveServer() *server.ServerConfig {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.activeServer
}

// IsRunning 检查代理是否正在运行
func (m *XrayProxyManager) IsRunning() bool {
	return m.GetStatus() == StatusRunning
}

// monitorProcess 监控Xray进程
func (m *XrayProxyManager) monitorProcess() {
	if m.cmd == nil {
		return
	}

	err := m.cmd.Wait()
	m.mu.Lock()
	defer m.mu.Unlock()

	if err != nil {
		fmt.Printf("Xray process exited with error: %v\n", err)
		m.status = StatusError
	} else {
		m.status = StatusStopped
	}

	m.cmd = nil
	m.activeServer = nil
}

// generateXrayConfig 生成Xray配置
func (m *XrayProxyManager) generateXrayConfig(config *server.ServerConfig) *XrayConfig {
	xrayConfig := &XrayConfig{
		Log: LogConfig{
			LogLevel: "warning",
		},
		Inbounds: []InboundConfig{
			{
				Tag:      "socks-in",
				Port:     1080,
				Protocol: "socks",
				Settings: map[string]interface{}{
					"auth": "noauth",
					"udp":  true,
				},
				Sniffing: &SniffingConfig{
					Enabled:      true,
					DestOverride: []string{"http", "tls"},
				},
			},
			{
				Tag:      "http-in",
				Port:     1081,
				Protocol: "http",
				Sniffing: &SniffingConfig{
					Enabled:      true,
					DestOverride: []string{"http", "tls"},
				},
			},
		},
		Outbounds: []OutboundConfig{
			m.generateOutboundConfig(config),
			{
				Tag:      "direct",
				Protocol: "freedom",
			},
			{
				Tag:      "block",
				Protocol: "blackhole",
			},
		},
		Routing: RoutingConfig{
			DomainStrategy: "IPIfNonMatch",
			Rules: []RuleConfig{
				{
					Type:        "field",
					OutboundTag: "direct",
					Domain:      []string{"geosite:cn"},
				},
				{
					Type:        "field",
					OutboundTag: "direct",
					IP:          []string{"geoip:cn", "geoip:private"},
				},
			},
		},
	}

	return xrayConfig
}

// generateOutboundConfig 生成出站配置
func (m *XrayProxyManager) generateOutboundConfig(config *server.ServerConfig) OutboundConfig {
	outbound := OutboundConfig{
		Tag:      "proxy",
		Protocol: config.Protocol,
	}

	switch config.Protocol {
	case "vmess":
		outbound.Settings = map[string]interface{}{
			"vnext": []map[string]interface{}{
				{
					"address": config.Address,
					"port":    config.Port,
					"users": []map[string]interface{}{
						{
							"id":       config.UUID,
							"alterId":  0,
							"security": "auto",
						},
					},
				},
			},
		}
	case "vless":
		outbound.Settings = map[string]interface{}{
			"vnext": []map[string]interface{}{
				{
					"address": config.Address,
					"port":    config.Port,
					"users": []map[string]interface{}{
						{
							"id":         config.UUID,
							"encryption": "none",
						},
					},
				},
			},
		}
	case "trojan":
		outbound.Settings = map[string]interface{}{
			"servers": []map[string]interface{}{
				{
					"address":  config.Address,
					"port":     config.Port,
					"password": config.Password,
				},
			},
		}
	case "shadowsocks":
		outbound.Settings = map[string]interface{}{
			"servers": []map[string]interface{}{
				{
					"address":  config.Address,
					"port":     config.Port,
					"method":   config.Method,
					"password": config.Password,
				},
			},
		}
	}

	// 添加传输层配置
	if config.Network != "" && config.Network != "tcp" {
		outbound.StreamSettings = &StreamSettings{
			Network: config.Network,
		}

		if config.TLS {
			outbound.StreamSettings.Security = "tls"
			outbound.StreamSettings.TLSSettings = map[string]interface{}{
				"serverName": config.SNI,
			}
		}

		if config.Network == "ws" {
			outbound.StreamSettings.WSSettings = map[string]interface{}{
				"path": config.Path,
				"headers": map[string]interface{}{
					"Host": config.Host,
				},
			}
		}
	}

	return outbound
}

// saveXrayConfig 保存Xray配置到文件
func (m *XrayProxyManager) saveXrayConfig(config *XrayConfig) error {
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal xray config: %w", err)
	}

	if err := os.WriteFile(m.configPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write xray config file: %w", err)
	}

	return nil
}