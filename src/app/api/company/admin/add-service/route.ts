import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CompanyService } from '@/services';
import { CompanyDAO } from '@/dao/company.dao';

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		if (session.user.role !== 'COMPANY') {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 });
		}

		const company = await CompanyDAO.findByUserId(parseInt(session.user.id));
		if (!company) {
			return NextResponse.json({ error: 'Company not found' }, { status: 404 });
		}

		const body = await request.json();
		const { serviceId } = body;
		if (!serviceId || typeof serviceId !== 'number') {
			return NextResponse.json({ error: 'Invalid serviceId' }, { status: 400 });
		}

		const result = await CompanyService.linkPlatformServices(company.id, [serviceId]);
		return NextResponse.json({ success: true, companyServices: result });
	} catch (error) {
		console.error('Error adding service to company:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
