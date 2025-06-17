// ==============================================
// HTML Post-Processing Utilities
// ==============================================
// Functions for processing generated HTML output

import { injectSlideNavigation } from '../components/slideNavigation';
import { sanitizeHtml, validateHtmlSafety } from './htmlSanitizer';

/**
 * Process generated HTML based on output type
 * @param generatedHtml - Raw HTML from LLM
 * @param outputType - Type of output ('webpage' | 'slides')
 * @returns Processed HTML with appropriate post-processing applied
 */
export const processGeneratedHtml = (generatedHtml: string, outputType: 'webpage' | 'slides' = 'webpage'): { 
  html: string; 
  warnings: string[] 
} => {
  const warnings: string[] = [];
  
  // First, validate and sanitize the HTML for security
  const safetyCheck = validateHtmlSafety(generatedHtml);
  if (!safetyCheck.isSafe) {
    warnings.push(...safetyCheck.warnings.map(w => `Security: ${w}`));
  }
  
  // Sanitize the HTML to remove dangerous content
  const sanitizedHtml = sanitizeHtml(generatedHtml);
  
  switch (outputType) {
    case 'slides':
      // Validate that required placeholders are present and check for forbidden navigation
      const validation = validateSlidesHtml(sanitizedHtml);
      
      if (!validation.isValid) {
        warnings.push(...validation.warnings);
        
        // Fallback: try to inject navigation at end of body if placeholder is missing
        if (validation.missingPlaceholders.includes('NAVIGATION_COMPONENT_PLACEHOLDER')) {
          warnings.push('Injecting navigation at end of body as fallback');
          return {
            html: injectSlideNavigation(sanitizedHtml),
            warnings
          };
        }
      }
      
      // For slides, inject the navigation component
      return {
        html: injectSlideNavigation(sanitizedHtml),
        warnings
      };
    
    case 'webpage':
    default:
      // For webpages, return sanitized HTML
      return {
        html: sanitizedHtml,
        warnings
      };
  }
};

/**
 * Validate that required placeholders are present in HTML
 * @param html - HTML content to validate
 * @param outputType - Type of output
 * @returns Validation result with missing placeholders
 */
export const validateHtmlPlaceholders = (html: string, outputType: 'webpage' | 'slides'): { 
  isValid: boolean; 
  missingPlaceholders: string[] 
} => {
  const missingPlaceholders: string[] = [];
  
  if (outputType === 'slides') {
    if (!html.includes('<!-- NAVIGATION_COMPONENT_PLACEHOLDER -->')) {
      missingPlaceholders.push('NAVIGATION_COMPONENT_PLACEHOLDER');
    }
  }
  
  return {
    isValid: missingPlaceholders.length === 0,
    missingPlaceholders
  };
};

/**
 * Comprehensive validation for slides HTML
 * @param html - HTML content to validate
 * @returns Validation result with warnings and missing placeholders
 */
export const validateSlidesHtml = (html: string): {
  isValid: boolean;
  warnings: string[];
  missingPlaceholders: string[];
} => {
  const warnings: string[] = [];
  const missingPlaceholders: string[] = [];
  
  // Check for missing navigation placeholder
  if (!html.includes('<!-- NAVIGATION_COMPONENT_PLACEHOLDER -->')) {
    missingPlaceholders.push('NAVIGATION_COMPONENT_PLACEHOLDER');
    warnings.push('Missing navigation placeholder - navigation will be injected at end of body');
  }
  
  // Check for forbidden navigation elements that LLM might have generated
  const forbiddenPatterns = [
    { pattern: /<button[^>]*(?:next|prev|slide|navigation)/i, message: 'Found navigation buttons - these will conflict with auto-injected navigation' },
    { pattern: /onclick.*(?:slide|next|prev)/i, message: 'Found navigation JavaScript - this will be overridden by auto-injected navigation' },
    { pattern: /addEventListener.*(?:keydown|click).*(?:slide|nav)/i, message: 'Found navigation event listeners - these will conflict with auto-injected navigation' },
    { pattern: /<div[^>]*id=["']?slide-navigation/i, message: 'Found manual slide navigation container - this will conflict with auto-injected navigation' },
    { pattern: /class=["'][^"']*(?:slide-nav|navigation)/i, message: 'Found navigation-related classes - these may conflict with auto-injected navigation' }
  ];
  
  forbiddenPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(html)) {
      warnings.push(`⚠️ LLM Non-compliance: ${message}`);
    }
  });
  
  // Check slide structure
  const slideMatches = html.match(/<section[^>]*class=["'][^"']*slide/g);
  if (!slideMatches || slideMatches.length === 0) {
    warnings.push('No properly structured slides found - slides should be <section class="slide">');
  }
  
  return {
    isValid: missingPlaceholders.length === 0 && warnings.filter(w => w.includes('LLM Non-compliance')).length === 0,
    warnings,
    missingPlaceholders
  };
};