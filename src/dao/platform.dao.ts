import { prisma } from '@/lib/prisma';

export class PlatformDAO {
    static async getActivePlatformServices() {
        return prisma.platformService.findMany({
            where: {
                status: 'ACTIVE',
            },
            select: {
                id: true,
                label: true,
                description: true,
                data_type: true,
                requires_data: true,
                data_label: true,
                data_description: true,
                choices: true,
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        ownedCompany: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                label: 'asc',
            },
        });
    }
}
