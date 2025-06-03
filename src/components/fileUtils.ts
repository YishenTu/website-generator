/**
 * 文件操作工具函数
 */

/**
 * 复制HTML代码到剪贴板
 * @param htmlContent HTML内容
 * @returns Promise<boolean> 是否成功
 */
export const copyHtmlToClipboard = async (htmlContent: string): Promise<boolean> => {
  if (!htmlContent) return false;
  
  try {
    await navigator.clipboard.writeText(htmlContent);
    return true;
  } catch (err) {
    console.error('Failed to copy code:', err);
    return false;
  }
};

/**
 * 下载HTML文件
 * @param htmlContent HTML内容
 * @param filename 文件名（默认：'generated-website.html'）
 */
export const downloadHtmlFile = (htmlContent: string, filename: string = 'generated-website.html'): void => {
  if (!htmlContent) return;
  
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 