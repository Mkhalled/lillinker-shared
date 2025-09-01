import { CompanyDAO } from '@/dao/company.dao';
import { FreelanceDao } from '@/dao/freelance.dao';
import { UserDAO } from '@/dao/user.dao';
import type { Prisma } from '@prisma/client';

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

  /**
   * Update user information
   */
  static async updateUserInfo(userId: number, data: Prisma.UserUpdateInput) {
    return UserDAO.update(userId, data);
  }

  /**
   * Update company information
   */
  static async updateCompanyInfo(userId: number, data: Prisma.CompanyUpdateInput, selectedLabels?: number[]) {
    // First find the company by admin user id
    const company = await CompanyDAO.findByUserId(userId);
    if (!company) {
      throw new Error('Company not found');
    }
    
    // Update company basic information
    const updatedCompany = await CompanyDAO.update(company.id, data);
    
    // Update labels if company is portage and selectedLabels is provided
    if (data.is_portage && selectedLabels !== undefined) {
      await CompanyDAO.replaceCompanyLabels(company.id, selectedLabels);
    } else if (!data.is_portage) {
      // If no longer a portage company, remove all labels
      await CompanyDAO.deleteCompanyLabels(company.id);
    }
    
    return updatedCompany;
  }

  /**
   * Update freelance information
   */
  static async updateFreelanceInfo(userId: number, data: number) {
    // First find the freelance by user id to ensure it exists
    const freelance = await FreelanceDao.findByFreelanceId(userId);
    if (!freelance) {
      throw new Error('Freelance not found');
    }
    
    return FreelanceDao.update(userId, data);
  }
}
