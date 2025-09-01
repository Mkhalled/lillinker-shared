import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { ProfileService } from '@/services/profile/profile-service.service';

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only allow company admins to update company info
  if (session.user.role !== 'COMPANY') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      name,
      description,
      consultant_count,
      siret,
      management_min,
      management_max,
      is_portage,
      date_creation,
      chiffre_affaires,
      adresse,
      site_web,
      convention_collective,
      code_naf_ape,
      selected_labels,
    } = body;

    // Validate required fields
    if (!name || consultant_count === undefined) {
      return NextResponse.json(
        { error: "Nom de l'entreprise et nombre de consultants sont obligatoires" },
        { status: 400 }
      );
    }

    // Update company information
    const updatedCompany = await ProfileService.updateCompanyInfo(
      Number(session.user.id),
      {
        name,
        description,
        consultant_count: parseInt(consultant_count),
        siret,
        management_min: management_min ? parseFloat(management_min) : null,
        management_max: management_max ? parseFloat(management_max) : null,
        is_portage: Boolean(is_portage),
        date_creation: date_creation ? new Date(date_creation) : null,
        chiffre_affaires: chiffre_affaires ? parseFloat(chiffre_affaires) : null,
        adresse,
        site_web,
        convention_collective,
        code_naf_ape,
      },
      selected_labels // Pass selected labels as second parameter
    );

    return NextResponse.json({
      message: "Informations de l'entreprise mises à jour avec succès",
      company: updatedCompany,
    });
  } catch (error) {
    console.error('Error updating company info:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des informations de l'entreprise" },
      { status: 500 }
    );
  }
}
