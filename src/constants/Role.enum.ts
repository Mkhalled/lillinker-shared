export enum RoleEnum {
  CONSULTANT = 'CONSULTANT',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  COMPANY_MANAGER = 'COMPANY_MANAGER',
}

// Helper function to check if a string is a valid role
export function isValidRole(role: string): role is RoleEnum {
  return Object.values(RoleEnum).includes(role as RoleEnum);
}

// Helper function to get all valid roles
export function getAllRoles(): RoleEnum[] {
  return Object.values(RoleEnum);
}
