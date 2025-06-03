import { getModelInfo } from "../services/aiService";

/**
 * 文本处理工具函数
 */

/**
 * 清理AI生成的文本输出，移除markdown代码块标记等
 * @param text 原始文本
 * @returns 清理后的文本
 */
export const cleanTextOutput = (text: string): string => {
  // 使用更全面的正则表达式匹配代码块，包括可选的语言标识符
  const fenceRegex = /^```(?:[a-zA-Z0-9]*\s*)?\n?(.*?)\n?```$/s;
  const match = text.match(fenceRegex);
  
  if (match && match[1] !== undefined) {
    return match[1].trim();
  }
  
  // 如果正则不匹配但仍以三个反引号开始和结束，手动处理
  if (text.startsWith("```") && text.endsWith("```")) {
    let cleaned = text.substring(3, text.length - 3);
    // 移除开头的语言标识符
    cleaned = cleaned.replace(/^[a-zA-Z0-9]*\s*/, '');
    return cleaned.trim();
  }
  
  return text.trim();
};

/**
 * 获取AI模型的显示名称
 * @param modelId 模型ID字符串
 * @returns 显示名称
 */
export const getModelDisplayName = (modelId: string): string => {
  const modelInfo = getModelInfo(modelId);
  return modelInfo?.name || modelId;
}; 