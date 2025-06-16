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
      // Validate that required placeholders are present (check both original and sanitized)
      const validation = validateHtmlPlaceholders(sanitizedHtml, outputType);
      
      if (!validation.isValid) {
        warnings.push(`Missing placeholders: ${validation.missingPlaceholders.join(', ')}`);
        
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