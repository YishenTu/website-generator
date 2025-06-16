// ==============================================
// HTML Sanitization Utilities
// ==============================================
// Basic sanitization to prevent XSS attacks from LLM-generated content

/**
 * Sanitize HTML content by removing potentially dangerous elements and attributes
 * @param html - Raw HTML content
 * @returns Sanitized HTML content
 */
export const sanitizeHtml = (html: string): string => {
  // List of dangerous tags to remove completely
  const dangerousTags = [
    'script',
    'iframe',
    'object',
    'embed',
    'form',
    'input',
    'textarea',
    'button',
    'select',
    'option'
  ];
  
  // List of dangerous attributes to remove
  const dangerousAttributes = [
    'onload',
    'onerror',
    'onclick',
    'onmouseover',
    'onmouseout',
    'onfocus',
    'onblur',
    'onchange',
    'onsubmit',
    'onkeydown',
    'onkeyup',
    'onkeypress',
    'javascript:'
  ];
  
  let sanitized = html;
  
  // Remove dangerous tags and their content
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, 'gis');
    sanitized = sanitized.replace(regex, '');
    
    // Also remove self-closing versions
    const selfClosingRegex = new RegExp(`<${tag}[^>]*\/?>`, 'gis');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });
  
  // Remove dangerous attributes
  dangerousAttributes.forEach(attr => {
    // Remove attribute="value" patterns
    const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gis');
    sanitized = sanitized.replace(regex, '');
    
    // Remove attribute=value patterns (no quotes)
    const noQuoteRegex = new RegExp(`\\s${attr}\\s*=\\s*[^\\s>]+`, 'gis');
    sanitized = sanitized.replace(noQuoteRegex, '');
    
    // Remove standalone attributes
    const standaloneRegex = new RegExp(`\\s${attr}(?=\\s|>)`, 'gis');
    sanitized = sanitized.replace(standaloneRegex, '');
  });
  
  // Remove javascript: protocol from href and src attributes
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']javascript:[^"']*["']/gis, '');
  
  // Remove data: URLs that could contain scripts (but allow safe ones like images)
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']data:(?!image\/)[^"']*["']/gis, '');
  
  return sanitized;
};

/**
 * Basic validation to check if HTML content appears safe
 * @param html - HTML content to validate
 * @returns Validation result with security warnings
 */
export const validateHtmlSafety = (html: string): {
  isSafe: boolean;
  warnings: string[];
} => {
  const warnings: string[] = [];
  
  // Check for potential script injection
  if (/<script[^>]*>/i.test(html)) {
    warnings.push('Contains script tags');
  }
  
  if (/javascript:/i.test(html)) {
    warnings.push('Contains javascript: protocol');
  }
  
  // Check for dangerous event handlers
  if (/on\w+\s*=/i.test(html)) {
    warnings.push('Contains event handler attributes');
  }
  
  // Check for iframe or object tags
  if (/<(iframe|object|embed)[^>]*>/i.test(html)) {
    warnings.push('Contains embedded content tags');
  }
  
  return {
    isSafe: warnings.length === 0,
    warnings
  };
};