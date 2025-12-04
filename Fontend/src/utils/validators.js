
/**
 * Validation Utilities cho Frontend
 */

export const validators = {
  // Validate Email
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email là bắt buộc';
    if (!emailRegex.test(email)) return 'Email không hợp lệ';
    return '';
  },

  // Validate Password
  validatePassword: (password) => {
    if (!password) return 'Mật khẩu là bắt buộc';
    if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!/[A-Z]/.test(password)) return 'Mật khẩu phải chứa ít nhất một chữ hoa';
    if (!/[0-9]/.test(password)) return 'Mật khẩu phải chứa ít nhất một chữ số';
    return '';
  },

  // Validate Name
  validateName: (name) => {
    if (!name) return 'Họ và tên là bắt buộc';
    if (name.trim().length < 2) return 'Họ và tên phải có ít nhất 2 ký tự';
    if (name.trim().length > 100) return 'Họ và tên không vượt quá 100 ký tự';
    return '';
  },

  // Validate Password Match
  validatePasswordMatch: (password, confirmPassword) => {
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp';
    return '';
  },

  // Validate Form
  validateLoginForm: (email, password) => {
    const errors = {};
    const emailError = validators.validateEmail(email);
    const passwordError = validators.validatePassword(password);

    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;

    return errors;
  },

  validateRegisterForm: (name, email, password, confirmPassword) => {
    const errors = {};
    const nameError = validators.validateName(name);
    const emailError = validators.validateEmail(email);
    const passwordError = validators.validatePassword(password);
    const matchError = validators.validatePasswordMatch(password, confirmPassword);

    if (nameError) errors.name = nameError;
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    if (matchError) errors.confirmPassword = matchError;

    return errors;
  },

  validateResetPasswordForm: (password, confirmPassword) => {
    const errors = {};
    const passwordError = validators.validatePassword(password);
    const matchError = validators.validatePasswordMatch(password, confirmPassword);

    if (passwordError) errors.password = passwordError;
    if (matchError) errors.confirmPassword = matchError;

    return errors;
  },

  validateForgotPasswordForm: (email) => {
    const errors = {};
    const emailError = validators.validateEmail(email);

    if (emailError) errors.email = emailError;

    return errors;
  },
};

export default validators;