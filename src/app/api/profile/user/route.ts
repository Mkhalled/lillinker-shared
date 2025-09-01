import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { ProfileService } from '@/services/profile/profile-service.service';

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { first_name, last_name, phone_number, sex } = body;

    // Validate required fields
    if (!first_name || !last_name) {
      return NextResponse.json({ error: 'Prénom et nom sont obligatoires' }, { status: 400 });
    }

    // Update user information
    const updatedUser = await ProfileService.updateUserInfo(Number(session.user.id), {
      first_name,
      last_name,
      phone_number,
      sex,
    });

    return NextResponse.json({
      message: 'Informations utilisateur mises à jour avec succès',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user info:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des informations' },
      { status: 500 }
    );
  }
}
