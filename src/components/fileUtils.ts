/**
 * 文件操作工具函数
 */

/**
 * 使用传统方法复制文本到剪贴板（回退方案）
 * @param text 要复制的文本
 * @returns boolean 是否成功
 */
const fallbackCopyToClipboard = (text: string): boolean => {
  try {
    // 创建临时的 textarea 元素
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    textarea.style.opacity = '0';
    
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    // 尝试执行复制命令
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (successful) {
      console.log('使用回退方法成功复制到剪贴板');
      return true;
    } else {
      console.error('回退方法复制失败：execCommand 返回 false');
      return false;
    }
  } catch (err) {
    console.error('回退方法复制失败:', err);
    return false;
  }
};

/**
 * 复制HTML代码到剪贴板
 * @param htmlContent HTML内容
 * @returns Promise<boolean> 是否成功
 */
export const copyHtmlToClipboard = async (htmlContent: string): Promise<boolean> => {
  if (!htmlContent) {
    console.error('复制失败：HTML内容不能为空');
    return false;
  }
  
  // 首先尝试使用现代的 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(htmlContent);
      console.log('使用 Clipboard API 成功复制到剪贴板');
      return true;
    } catch (err) {
      console.warn('Clipboard API 复制失败，尝试使用回退方法:', err);
      // 如果 Clipboard API 失败，尝试回退方法
      return fallbackCopyToClipboard(htmlContent);
    }
  } else {
    // 如果不支持 Clipboard API 或不在安全上下文中，直接使用回退方法
    console.log('不支持 Clipboard API 或非安全上下文，使用回退方法');
    return fallbackCopyToClipboard(htmlContent);
  }
};

/**
 * 验证文件名格式
 * @param filename 文件名
 * @returns 是否为有效的HTML文件名
 */
const isValidHtmlFilename = (filename: string): boolean => {
  if (!filename || typeof filename !== 'string' || filename.trim() === '') {
    return false;
  }
  
  // 检查是否以 .html 或 .htm 结尾
  const trimmedFilename = filename.trim();
  return /\.(html|htm)$/i.test(trimmedFilename);
};

/**
 * 下载HTML文件
 * @param htmlContent HTML内容
 * @param filename 文件名（默认：'generated-website.html'）
 * @returns Promise<boolean> 是否成功下载
 */
export const downloadHtmlFile = async (htmlContent: string, filename: string = 'generated-website.html'): Promise<boolean> => {
  if (!htmlContent) {
    console.error('下载失败：HTML内容不能为空');
    return false;
  }
  
  // 验证文件名
  if (!isValidHtmlFilename(filename)) {
    console.error('下载失败：文件名格式无效，必须是非空字符串且以 .html 或 .htm 结尾');
    return false;
  }
  
  try {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.trim();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`文件 "${filename}" 下载成功`);
    return true;
  } catch (err) {
    console.error('下载文件时发生错误:', err);
    // 可以在这里添加用户通知逻辑，比如显示错误提示
    return false;
  }
}; 