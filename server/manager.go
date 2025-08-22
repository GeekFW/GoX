package server

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

// FileServerManager 基于文件系统的服务器管理器
type FileServerManager struct {
	storageDir string // 存储目录
}

// NewFileServerManager 创建新的文件服务器管理器
func NewFileServerManager(storageDir string) *FileServerManager {
	return &FileServerManager{
		storageDir: storageDir,
	}
}

// ensureStorageDir 确保存储目录存在
func (m *FileServerManager) ensureStorageDir() error {
	return os.MkdirAll(m.storageDir, 0755)
}

// generateFileName 生成文件名：服务器名称+IP+端口.json
func (m *FileServerManager) generateFileName(config *ServerConfig) string {
	// 清理文件名中的非法字符
	name := strings.ReplaceAll(config.Name, " ", "_")
	name = strings.ReplaceAll(name, "/", "_")
	name = strings.ReplaceAll(name, "\\", "_")
	name = strings.ReplaceAll(name, ":", "_")
	name = strings.ReplaceAll(name, "*", "_")
	name = strings.ReplaceAll(name, "?", "_")
	name = strings.ReplaceAll(name, "\"", "_")
	name = strings.ReplaceAll(name, "<", "_")
	name = strings.ReplaceAll(name, ">", "_")
	name = strings.ReplaceAll(name, "|", "_")
	
	return fmt.Sprintf("%s+%s+%d.json", name, config.Address, config.Port)
}

// getFilePath 获取配置文件的完整路径
func (m *FileServerManager) getFilePath(config *ServerConfig) string {
	fileName := m.generateFileName(config)
	return filepath.Join(m.storageDir, fileName)
}

// CreateServer 创建服务器配置
func (m *FileServerManager) CreateServer(config *ServerConfig) error {
	if err := m.ensureStorageDir(); err != nil {
		return fmt.Errorf("failed to ensure storage directory: %w", err)
	}

	// 验证服务器名称是否重复
	if err := m.ValidateServerName(config.Name, ""); err != nil {
		return err
	}

	// 生成唯一ID
	if config.ID == "" {
		config.ID = uuid.New().String()
	}

	// 设置创建和更新时间
	now := time.Now()
	config.Created = now
	config.Updated = now

	// 保存到文件
	return m.saveConfigToFile(config)
}

// GetServer 获取服务器配置
func (m *FileServerManager) GetServer(id string) (*ServerConfig, error) {
	configs, err := m.ListServers()
	if err != nil {
		return nil, err
	}

	for _, config := range configs {
		if config.ID == id {
			return config, nil
		}
	}

	return nil, fmt.Errorf("server with ID %s not found", id)
}

// UpdateServer 更新服务器配置
func (m *FileServerManager) UpdateServer(config *ServerConfig) error {
	// 获取原配置以保留创建时间
	oldConfig, err := m.GetServer(config.ID)
	if err != nil {
		return err
	}

	// 验证服务器名称是否重复（排除当前服务器）
	if err := m.ValidateServerName(config.Name, config.ID); err != nil {
		return err
	}

	// 删除旧文件
	oldFilePath := m.getFilePath(oldConfig)
	if err := os.Remove(oldFilePath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to remove old config file: %w", err)
	}

	// 保留创建时间，更新修改时间
	config.Created = oldConfig.Created
	config.Updated = time.Now()

	// 保存新配置
	return m.saveConfigToFile(config)
}

// DeleteServer 删除服务器配置
func (m *FileServerManager) DeleteServer(id string) error {
	config, err := m.GetServer(id)
	if err != nil {
		return err
	}

	filePath := m.getFilePath(config)
	if err := os.Remove(filePath); err != nil {
		return fmt.Errorf("failed to delete config file: %w", err)
	}

	return nil
}

// ListServers 列出所有服务器配置
func (m *FileServerManager) ListServers() ([]*ServerConfig, error) {
	if err := m.ensureStorageDir(); err != nil {
		return nil, fmt.Errorf("failed to ensure storage directory: %w", err)
	}

	var configs []*ServerConfig

	err := filepath.WalkDir(m.storageDir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		// 只处理JSON文件
		if d.IsDir() || !strings.HasSuffix(strings.ToLower(d.Name()), ".json") {
			return nil
		}

		// 读取并解析配置文件
		config, err := m.loadConfigFromFile(path)
		if err != nil {
			// 记录错误但继续处理其他文件
			fmt.Printf("Warning: failed to load config from %s: %v\n", path, err)
			return nil
		}

		configs = append(configs, config)
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to walk storage directory: %w", err)
	}

	return configs, nil
}

// ValidateServerName 验证服务器名称是否重复
func (m *FileServerManager) ValidateServerName(name string, excludeID string) error {
	configs, err := m.ListServers()
	if err != nil {
		return err
	}

	for _, config := range configs {
		if config.Name == name && config.ID != excludeID {
			return fmt.Errorf("服务器名称 '%s' 已存在", name)
		}
	}

	return nil
}

// AddServer 添加新服务器配置
func (m *FileServerManager) AddServer(config *ServerConfig) error {
	return m.CreateServer(config)
}

// RemoveServer 删除服务器配置（按名称）
func (m *FileServerManager) RemoveServer(name string) error {
	// 查找服务器
	servers, err := m.ListServers()
	if err != nil {
		return err
	}

	for _, server := range servers {
		if server.Name == name {
			return m.DeleteServer(server.ID)
		}
	}

	return fmt.Errorf("未找到名称为 '%s' 的服务器", name)
}

// saveConfigToFile 保存配置到文件
func (m *FileServerManager) saveConfigToFile(config *ServerConfig) error {
	filePath := m.getFilePath(config)

	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}

	return nil
}

// loadConfigFromFile 从文件加载配置
func (m *FileServerManager) loadConfigFromFile(filePath string) (*ServerConfig, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var config ServerConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return &config, nil
}