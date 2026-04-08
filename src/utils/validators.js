export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function validatePhone(phone) {
  const re = /^\+?[0-9]{8,15}$/;
  return re.test(phone);
}

export function validateRequired(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  return value != null;
}
