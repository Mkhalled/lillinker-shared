import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';

/**
 * Generates test data for a company
 * @param overrides - Optional overrides for the generated data
 * @returns Company creation data
 */
export const generateCompanyData = (
  overrides: Partial<Prisma.CompanyCreateInput> = {}
): Prisma.CompanyCreateInput => ({
  name: faker.company.name(),
  siret: faker.string.numeric(14),
  type: 'SARL',
  description: faker.lorem.sentence(),
  dateFondation: faker.date.past(),
  capital: faker.number.float({ min: 1000, max: 1000000 }),
  logo: faker.image.url(),
  isActive: true,
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  postalCode: faker.location.zipCode(),
  country: 'France',
  phone: faker.phone.number(),
  email: faker.internet.email(),
  managementCosts: faker.number.float({ min: 0, max: 10000 }),
  numberPorted: faker.number.int({ min: 0, max: 1000 }),
  ...overrides,
});
