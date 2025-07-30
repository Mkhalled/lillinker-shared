import { CompanyDAO } from '@/dao/company.dao';
import { FreelanceDao } from '@/dao/freelance.dao';
import { UserDAO } from '@/dao/user.dao';

export class ProfileService {
  /**
   * Get basic authenticated user info by user ID.
   */
  static async getAuthUserInfo(userId: number) {
    return UserDAO.findById(userId);
  }
  /**
   * Get basic authenticated user info based on role and user id.
   */
  static async getRoleBasedInfo(userId: number, role: string) {
    console.log('getRoleBasedInfo called with userId:', userId, 'and role:', role);
    if (role === 'COMPANY') {
      return CompanyDAO.findByUserId(userId);
    }
    if (role === 'FREELANCE') {
      return FreelanceDao.findByFreelanceId(userId);
    }
    return null;
  }
}
