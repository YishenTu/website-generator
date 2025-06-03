import { AIModel } from "../types/types";

/**
 * 文本处理工具函数
 */

/**
 * 清理AI生成的文本输出，移除markdown代码块标记等
 * @param text 原始文本
 * @returns 清理后的文本
 */
export const cleanTextOutput = (text: string): string => {
  let cleaned = text;
  const fenceRegex = /^```(?:[a-zA-Z]+)?\s*\n?(.*?)\n?\s*```$/si;
  const match = cleaned.match(fenceRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  } else if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
    const firstNewline = cleaned.indexOf('\n');
    const lastNewline = cleaned.lastIndexOf('\n');
    if (firstNewline !== -1 && lastNewline !== -1 && lastNewline > firstNewline) {
      cleaned = cleaned.substring(firstNewline + 1, lastNewline).trim();
    } else {
      cleaned = cleaned.substring(3, cleaned.length - 3).trim();
      const potentialKeywords = ["html", "text", "json", "javascript", "css", "markdown"];
      for (const keyword of potentialKeywords) {
          if (cleaned.toLowerCase().startsWith(keyword)) {
              cleaned = cleaned.substring(keyword.length).trim();
              break;
          }
      }
    }
  }
  return cleaned.trim();
};

/**
 * 获取AI模型的显示名称
 * @param model AI模型枚举
 * @returns 显示名称
 */
export const getModelDisplayName = (model: AIModel): string => {
  switch (model) {
    case AIModel.Gemini:
      return 'Gemini 2.5 Pro';
    case AIModel.Claude:
      return 'Claude 4 Sonnet';
    default:
      return 'Unknown Model';
  }
}; 