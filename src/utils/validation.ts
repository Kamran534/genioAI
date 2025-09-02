// Form validation types
export interface FormErrors {
  email?: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validation functions
export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return 'Email is required';
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  
  if (email.length > 254) {
    return 'Email address is too long';
  }
  
  return null;
};

export const validateNewsletterForm = (email: string): FormErrors => {
  const errors: FormErrors = {};
  
  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }
  
  return errors;
};

// Sanitization functions
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

// Rate limiting helper (for future implementation)
export const isRateLimited = (): boolean => {
  const lastSubmission = localStorage.getItem('lastNewsletterSubmission');
  if (!lastSubmission) return false;
  
  const timeDiff = Date.now() - parseInt(lastSubmission);
  const RATE_LIMIT_MS = 60000; // 1 minute
  
  return timeDiff < RATE_LIMIT_MS;
};

export const setRateLimit = (): void => {
  localStorage.setItem('lastNewsletterSubmission', Date.now().toString());
};
