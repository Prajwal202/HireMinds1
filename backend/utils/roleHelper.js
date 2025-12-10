/**
 * Role helper utilities
 * Handles role validation and normalization
 */

// Valid roles in the system
const VALID_ROLES = ['admin', 'freelancer', 'employer'];

// Role aliases (for frontend compatibility)
const ROLE_ALIASES = {
  'recruiter': 'employer',
  'client': 'employer'
};

/**
 * Normalize role (convert aliases to actual roles)
 * @param {string} role - The role to normalize
 * @returns {string} - Normalized role
 */
const normalizeRole = (role) => {
  if (!role) return 'freelancer'; // Default role
  
  const normalized = role.toLowerCase().trim();
  
  // Check if it's an alias
  if (ROLE_ALIASES[normalized]) {
    return ROLE_ALIASES[normalized];
  }
  
  // Return if valid, otherwise return default
  return VALID_ROLES.includes(normalized) ? normalized : 'freelancer';
};

/**
 * Validate if a role is valid
 * @param {string} role - The role to validate
 * @returns {boolean} - True if valid
 */
const isValidRole = (role) => {
  if (!role) return false;
  const normalized = normalizeRole(role);
  return VALID_ROLES.includes(normalized);
};

/**
 * Get role-specific dashboard path
 * @param {string} role - User role
 * @returns {string} - Dashboard path
 */
const getDashboardPath = (role) => {
  const normalized = normalizeRole(role);
  
  switch (normalized) {
    case 'admin':
      return '/admin';
    case 'employer':
      return '/recruiter/dashboard';
    case 'freelancer':
      return '/freelancer/dashboard';
    default:
      return '/dashboard';
  }
};

/**
 * Check if user has required role
 * @param {string} userRole - User's role
 * @param {string|Array} requiredRoles - Required role(s)
 * @returns {boolean} - True if user has required role
 */
const hasRole = (userRole, requiredRoles) => {
  const normalizedUserRole = normalizeRole(userRole);
  const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return rolesArray.some(role => normalizeRole(role) === normalizedUserRole);
};

module.exports = {
  VALID_ROLES,
  ROLE_ALIASES,
  normalizeRole,
  isValidRole,
  getDashboardPath,
  hasRole
};

