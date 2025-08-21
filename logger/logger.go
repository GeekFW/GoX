package logger

import (
	"os"
	"path/filepath"
	"strings"

	"Gox/constants"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

var (
	// Logger 全局日志实例
	Logger *zap.Logger
	// SugarLogger 全局Sugar日志实例
	SugarLogger *zap.SugaredLogger
)

// InitLogger 初始化日志系统
func InitLogger(level string, enabled bool) error {
	if !enabled {
		// 如果禁用日志，使用nop logger
		Logger = zap.NewNop()
		SugarLogger = Logger.Sugar()
		return nil
	}

	// 解析日志级别
	var zapLevel zapcore.Level
	switch level {
	case "debug":
		zapLevel = zapcore.DebugLevel
	case "info":
		zapLevel = zapcore.InfoLevel
	case "warn":
		zapLevel = zapcore.WarnLevel
	case "error":
		zapLevel = zapcore.ErrorLevel
	default:
		zapLevel = zapcore.InfoLevel
	}

	// 确保日志目录存在
	logDir := constants.GetLogDir()
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return err
	}

	// 配置日志轮转
	lumberjackLogger := &lumberjack.Logger{
		Filename:   constants.GetLogFilePath(),
		MaxSize:    10, // MB
		MaxBackups: 5,
		MaxAge:     30, // days
		Compress:   true,
	}

	// 创建编码器配置
	encoderConfig := zap.NewProductionEncoderConfig()
	encoderConfig.TimeKey = "timestamp"
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder

	// 创建核心
	core := zapcore.NewTee(
		// 文件输出
		zapcore.NewCore(
			zapcore.NewJSONEncoder(encoderConfig),
			zapcore.AddSync(lumberjackLogger),
			zapLevel,
		),
		// 控制台输出（开发模式）
		zapcore.NewCore(
			zapcore.NewConsoleEncoder(encoderConfig),
			zapcore.AddSync(os.Stdout),
			zapLevel,
		),
	)

	// 创建logger
	Logger = zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))
	SugarLogger = Logger.Sugar()

	return nil
}

// GetLogger 获取日志实例
func GetLogger() *zap.Logger {
	return Logger
}

// GetSugarLogger 获取Sugar日志实例
func GetSugarLogger() *zap.SugaredLogger {
	return SugarLogger
}

// Sync 同步日志
func Sync() {
	if Logger != nil {
		Logger.Sync()
	}
}

// ReadLogFile 读取日志文件内容
func ReadLogFile(lines int) ([]string, error) {
	logPath := constants.GetLogFilePath()
	data, err := os.ReadFile(logPath)
	if err != nil {
		return nil, err
	}

	// 简单实现：按行分割并返回最后N行
	allLines := strings.Split(string(data), "\n")
	if lines <= 0 || lines >= len(allLines) {
		return allLines, nil
	}

	return allLines[len(allLines)-lines:], nil
}

// GetLogFiles 获取日志文件列表
func GetLogFiles() ([]string, error) {
	logDir := constants.GetLogDir()
	files, err := filepath.Glob(filepath.Join(logDir, "*.log*"))
	if err != nil {
		return nil, err
	}
	return files, nil
}
