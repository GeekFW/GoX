import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并CSS类名的工具函数
 * @param {...any} inputs - CSS类名
 * @returns {string} 合并后的类名
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}