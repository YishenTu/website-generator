/**
 * Input validation utilities for text limits and content sanitization
 */

// Validation constants
export const VALIDATION_LIMITS = {
  REPORT_TEXT_MIN: 50,
  REPORT_TEXT_MAX: 50000,
  CHAT_MESSAGE_MAX: 2000,
  PLAN_TEXT_MAX: 100000,
  HTML_CONTENT_MAX: 500000
} as const;

export const VALIDATION_MESSAGES = {
  REPORT_TOO_SHORT: `Report must be at least ${VALIDATION_LIMITS.REPORT_TEXT_MIN} characters long.`,
  REPORT_TOO_LONG: `Report cannot exceed ${VALIDATION_LIMITS.REPORT_TEXT_MAX} characters.`,
  CHAT_MESSAGE_TOO_LONG: `Message cannot exceed ${VALIDATION_LIMITS.CHAT_MESSAGE_MAX} characters.`,
  PLAN_TOO_LONG: `Plan cannot exceed ${VALIDATION_LIMITS.PLAN_TEXT_MAX} characters.`,
  HTML_TOO_LONG: `HTML content cannot exceed ${VALIDATION_LIMITS.HTML_CONTENT_MAX} characters.`,
  INVALID_CHARACTERS: 'Text contains invalid characters.',
  POTENTIALLY_HARMFUL: 'Content contains potentially harmful elements.'
} as const;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedText?: string;
}

/**
 * Sanitize text input by removing potentially harmful content
 */
export function sanitizeText(text: string): string {
  // Remove null bytes and control characters except newlines and tabs
  let sanitized = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Remove excessive whitespace but preserve intentional formatting
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines
  sanitized = sanitized.replace(/[ \t]{10,}/g, '    '); // Max 4 consecutive spaces/tabs
  
  // Remove potential script injection attempts (basic protection)
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  return sanitized.trim();
}

/**
 * Validate report text input
 */
export function validateReportText(text: string): ValidationResult {
  const sanitized = sanitizeText(text);
  
  if (sanitized.length < VALIDATION_LIMITS.REPORT_TEXT_MIN) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.REPORT_TOO_SHORT,
      sanitizedText: sanitized
    };
  }
  
  if (sanitized.length > VALIDATION_LIMITS.REPORT_TEXT_MAX) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.REPORT_TOO_LONG,
      sanitizedText: sanitized
    };
  }
  
  return {
    isValid: true,
    sanitizedText: sanitized
  };
}

/**
 * Validate chat message input
 */
export function validateChatMessage(text: string): ValidationResult {
  const sanitized = sanitizeText(text);
  
  if (sanitized.length === 0) {
    return {
      isValid: false,
      error: 'Message cannot be empty.',
      sanitizedText: sanitized
    };
  }
  
  if (sanitized.length > VALIDATION_LIMITS.CHAT_MESSAGE_MAX) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.CHAT_MESSAGE_TOO_LONG,
      sanitizedText: sanitized
    };
  }
  
  return {
    isValid: true,
    sanitizedText: sanitized
  };
}

/**
 * Validate plan text
 */
export function validatePlanText(text: string): ValidationResult {
  const sanitized = sanitizeText(text);
  
  if (sanitized.length > VALIDATION_LIMITS.PLAN_TEXT_MAX) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.PLAN_TOO_LONG,
      sanitizedText: sanitized
    };
  }
  
  return {
    isValid: true,
    sanitizedText: sanitized
  };
}

/**
 * Validate HTML content
 */
export function validateHtmlContent(html: string): ValidationResult {
  // Basic HTML sanitization - remove dangerous elements
  let sanitized = html;
  
  // Remove script tags and event handlers
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove potentially dangerous elements
  const dangerousElements = ['object', 'embed', 'applet', 'form', 'input', 'button'];
  dangerousElements.forEach(element => {
    const regex = new RegExp(`<${element}[^>]*>.*?<\/${element}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  if (sanitized.length > VALIDATION_LIMITS.HTML_CONTENT_MAX) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.HTML_TOO_LONG,
      sanitizedText: sanitized
    };
  }
  
  return {
    isValid: true,
    sanitizedText: sanitized
  };
}

/**
 * Get character count with formatting
 */
export function formatCharacterCount(current: number, max: number): string {
  const percentage = (current / max) * 100;
  
  if (percentage > 90) {
    return `${current}/${max} (${Math.round(percentage)}%) - Approaching limit`;
  } else if (percentage > 75) {
    return `${current}/${max} (${Math.round(percentage)}%)`;
  } else {
    return `${current}/${max}`;
  }
}

/**
 * Check if text is approaching character limit
 */
export function isApproachingLimit(current: number, max: number, threshold: number = 0.8): boolean {
  return (current / max) >= threshold;
}