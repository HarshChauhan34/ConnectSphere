export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const passwordRequirements = [
  {
    label: "at least 8 characters",
    test: (password) => password.length >= 8,
  },
  {
    label: "one lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: "one uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: "one number",
    test: (password) => /\d/.test(password),
  },
  {
    label: "one special character",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export const normalizeEmail = (email = "") => email.trim().toLowerCase();

export const isValidEmail = (email = "") => emailRegex.test(normalizeEmail(email));

export const getPasswordErrors = (password = "") =>
  passwordRequirements
    .filter((requirement) => !requirement.test(password))
    .map((requirement) => requirement.label);

export const isStrongPassword = (password = "") =>
  getPasswordErrors(password).length === 0;

export const passwordPolicyMessage =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
