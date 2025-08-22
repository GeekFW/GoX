import React from 'react'
import { cn } from '../../lib/utils'

/**
 * 闪动文字组件
 * @param {string} text - 要显示的文字
 * @param {string} className - 额外的CSS类名
 * @param {number} speed - 动画速度（秒）
 * @param {boolean} disabled - 是否禁用动画
 */
const ShinyText = ({ 
  text, 
  className = '', 
  speed = 5, 
  disabled = false 
}) => {
  const animationDuration = `${speed}s`

  return (
    <div 
      className={cn(
        'shiny-text inline-block',
        !disabled && 'animate-shine',
        className
      )}
      style={{
        backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animationDuration: animationDuration,
      }}
    >
      {text}
    </div>
  )
}

export { ShinyText }