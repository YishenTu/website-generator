// ==============================================
// HTML Sanitization Utilities
// ==============================================
// Basic sanitization to prevent XSS attacks from LLM-generated content

/**
 * List of trusted CDN domains for external scripts
 */
const TRUSTED_CDN_DOMAINS = [
  'cdn.tailwindcss.com',
  'cdnjs.cloudflare.com', 
  'fonts.googleapis.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'd3js.org',
  'code.jquery.com',
  'stackpath.bootstrapcdn.com',
  'maxcdn.bootstrapcdn.com',
  'ajax.googleapis.com',
  'cdn.plot.ly',
  'threejs.org'
];

/**
 * Check if a script tag references a trusted external CDN
 * @param scriptTag - The full script tag string
 * @returns boolean indicating if the script is from a trusted CDN
 */
const isTrustedExternalScript = (scriptTag: string): boolean => {
  // Extract src attribute from script tag
  const srcMatch = scriptTag.match(/src\s*=\s*["']([^"']+)["']/i);
  if (!srcMatch || !srcMatch[1]) {
    // No src attribute means it's inline script - not trusted
    return false;
  }
  
  const src = srcMatch[1];
  
  // Check if the src is from a trusted CDN domain
  return TRUSTED_CDN_DOMAINS.some(domain => src.includes(domain));
};

/**
 * Sanitize HTML content by removing potentially dangerous elements and attributes
 * @param html - Raw HTML content
 * @returns Sanitized HTML content
 */
export const sanitizeHtml = (html: string): string => {
  // List of dangerous tags to remove completely (excluding script for special handling)
  const dangerousTags = [
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
  
  // Special handling for script tags - keep trusted external CDN scripts but remove dangerous ones
  const scriptTagRegex = /<script[^>]*>.*?<\/script>/gis;
  const selfClosingScriptRegex = /<script[^>]*\/>/gis;
  
  // Find all script tags and filter them
  const allScriptMatches = [...sanitized.matchAll(scriptTagRegex), ...sanitized.matchAll(selfClosingScriptRegex)];
  
  allScriptMatches.forEach(match => {
    const scriptTag = match[0];
    if (!isTrustedExternalScript(scriptTag)) {
      // Remove untrusted/inline scripts
      sanitized = sanitized.replace(scriptTag, '');
    }
  });
  
  // Remove other dangerous tags and their content
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
  
  // Check for inline script content (not external CDN scripts)
  const inlineScriptRegex = /<script(?![^>]*src\s*=\s*["'][^"']*["'])[^>]*>/i;
  if (inlineScriptRegex.test(html)) {
    warnings.push('Contains inline script tags');
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