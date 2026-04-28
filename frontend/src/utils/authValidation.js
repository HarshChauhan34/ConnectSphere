export const passwordRequirements = [
  {
    label: "8+ characters",
    test: (password) => password.length >= 8,
  },
  {
    label: "lowercase",
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: "uppercase",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: "number",
    test: (password) => /\d/.test(password),
  },
  {
    label: "special character",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export const normalizeEmail = (email = "") => email.trim().toLowerCase();

export const isValidEmail = (email = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(email));

export const getPasswordErrors = (password = "") =>
  passwordRequirements
    .filter((requirement) => !requirement.test(password))
    .map((requirement) => requirement.label);

export const isStrongPassword = (password = "") =>
  getPasswordErrors(password).length === 0;

export const passwordPolicyMessage =
  "Use 8+ characters with uppercase, lowercase, number, and special character.";
