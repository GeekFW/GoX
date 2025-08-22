package main

import "embed"

// XrayBinary 嵌入的xray.exe二进制文件
//go:embed resources/xray.exe
var XrayBinary embed.FS