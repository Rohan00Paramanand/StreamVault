/**
 * StreamVault Authentication & RBAC Service
 * Supports Admin (Upload & Manage) and Viewer (Watch & Favorite) roles.
 * Persists user accounts and active sessions securely in localStorage.
 */

const USERS_STORAGE_KEY = 'streamvault_registered_users_v1';
const SESSION_STORAGE_KEY = 'streamvault_active_session_v1';

// Default pre-configured accounts
const DEFAULT_USERS = [
  {
    id: 'user-admin',
    name: 'Vault Administrator',
    email: 'admin@streamvault.com',
    password: 'admin123', // Demo admin credentials
    role: 'admin',        // 'admin' | 'viewer'
    createdAt: '2024-01-01',
  },
  {
    id: 'user-viewer',
    name: 'Guest Viewer',
    email: 'viewer@streamvault.com',
    password: 'viewer123',
    role: 'viewer',
    createdAt: '2024-01-01',
  }
];

/**
 * Initializes and retrieves the registered users registry
 * @returns {Array}
 */
export function getRegisteredUsers() {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USERS;
  } catch (err) {
    console.error('Failed to load registered users:', err);
    return DEFAULT_USERS;
  }
}

/**
 * Retrieves the currently authenticated user session
 * @returns {Object|null}
 */
export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to parse current user session:', err);
    return null;
  }
}

/**
 * Authenticates a user by email and password
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, user?: Object, error?: string }}
 */
export function loginUser(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: 'Email and password are required.' };
  }

  const users = getRegisteredUsers();
  const match = users.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPass
  );

  if (!match) {
    return { success: false, error: 'Invalid email or password credentials.' };
  }

  const sessionData = {
    id: match.id,
    name: match.name,
    email: match.email,
    role: match.role,
    loggedInAt: new Date().toISOString(),
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  return { success: true, user: sessionData };
}

/**
 * Registers a new regular user account (Viewer role)
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, user?: Object, error?: string }}
 */
export function registerUser(name, email, password) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanName || !cleanEmail || !cleanPass) {
    return { success: false, error: 'All fields are required.' };
  }

  if (cleanPass.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const users = getRegisteredUsers();
  const emailExists = users.some((u) => u.email.toLowerCase() === cleanEmail);

  if (emailExists) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: cleanName,
    email: cleanEmail,
    password: cleanPass,
    role: 'viewer', // Regular users can only browse and watch
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  const sessionData = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    loggedInAt: new Date().toISOString(),
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  return { success: true, user: sessionData };
}

/**
 * Terminates active session
 */
export function logoutUser() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Checks if a user object holds administrator privileges
 * @param {Object} user
 * @returns {boolean}
 */
export function isUserAdmin(user) {
  return Boolean(user && user.role === 'admin');
}
