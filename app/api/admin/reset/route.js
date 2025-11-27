import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso';

export async function POST(request) {
  try {
    const { password } = await request.json();

    // Vérifier le mot de passe
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    const client = getTursoClient();

    // Réinitialiser toutes les cases
    await client.execute('UPDATE boxes SET reserved = 0, user_id = NULL');

    // Supprimer tous les utilisateurs
    await client.execute('DELETE FROM users');

    return NextResponse.json({
      success: true,
      message: 'Base de données réinitialisée avec succès',
      timestamp: Date.now()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation' },
      { status: 500 }
    );
  }
}