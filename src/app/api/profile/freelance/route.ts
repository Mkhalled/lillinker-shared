import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { ProfileService } from '@/services/profile/profile-service.service';

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only allow freelancers to update freelance info
  if (session.user.role !== 'FREELANCE') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { secteur_activite_id } = body;

    // Validate required fields
    if (!secteur_activite_id) {
      return NextResponse.json(
        { error: 'Secteur d\'activité est obligatoire' },
        { status: 400 }
      );
    }

    // Update freelance information
    const updatedFreelance = await ProfileService.updateFreelanceInfo(Number(session.user.id), secteur_activite_id);

    return NextResponse.json({
      message: 'Secteur d\'activité mis à jour avec succès',
      freelance: updatedFreelance,
    });
  } catch (error) {
    console.error('Error updating freelance info:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du secteur d\'activité' },
      { status: 500 }
    );
  }
}
