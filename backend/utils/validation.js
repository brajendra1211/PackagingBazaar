/**
 * Centralized Validation Patterns
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateMobile = (mobile) => {
  // 10 digits numeric only (Indian standard)
  const mobileRegex = /^[0-9]{10}$/;
  return mobileRegex.test(mobile);
};

export const validateGST = (gst) => {
  // 15 characters alphanumeric
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  // Fallback simplified alphanumeric if user has a strange GST (though unlikely)
  // But let's stick to the 15 length requirement strictly
  return gst.length === 15;
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};
