/**
 * Sanitizes text input by removing potentially dangerous characters
 * and trimming whitespace
 */
export function sanitizeTextInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // Trim whitespace
  let sanitized = input.trim();

  // Remove null bytes and other control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  // Basic XSS prevention - remove script tags and event handlers
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]*>/g, ''); // Remove all HTML tags
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  return sanitized;
}

/**
 * Sanitizes HTML content (for rich text inputs)
 */
export function sanitizeHtmlInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // For frontend, we'll use the same sanitization as text input
  // since we don't need complex HTML sanitization for our use case
  return sanitizeTextInput(input);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 */
export function isValidPassword(password: string): boolean {
  // At least 6 characters, contains letters and numbers
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
}

/**
 * Counts words in a string
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Validates agent name format
 */
export function isValidAgentName(name: string): boolean {
  const nameRegex = /^[a-zA-Z0-9\s\-_]+$/;
  return nameRegex.test(name) && name.length <= 100;
}

/**
 * Validates domain format
 */
export function isValidDomain(domain: string): boolean {
  if (!domain) return true; // Optional field
  const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain) && domain.length <= 253;
}

/**
 * Sanitizes and validates form input
 */
export function sanitizeAndValidateInput(
  value: string,
  options: {
    maxLength?: number;
    allowHtml?: boolean;
    fieldName?: string;
  } = {}
): { sanitized: string; isValid: boolean; error?: string } {
  const { maxLength, allowHtml = false, fieldName = 'input' } = options;

  // Sanitize
  const sanitized = allowHtml
    ? sanitizeHtmlInput(value)
    : sanitizeTextInput(value);

  // Check length
  if (maxLength && sanitized.length > maxLength) {
    return {
      sanitized,
      isValid: false,
      error: `${fieldName} must not exceed ${maxLength} characters`
    };
  }

  return { sanitized, isValid: true };
}