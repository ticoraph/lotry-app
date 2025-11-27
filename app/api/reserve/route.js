import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso';

export async function POST(request) {
  try {
    const { name, phone, selectedBoxes } = await request.json();

    if (!name || !phone || !selectedBoxes || selectedBoxes.length === 0) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const client = getTursoClient();

    // Vérifier que toutes les cases sont disponibles
    for (const boxNum of selectedBoxes) {
      const result = await client.execute({
        sql: 'SELECT reserved FROM boxes WHERE number = ?',
        args: [boxNum]
      });

      if (result.rows[0]?.reserved === 1) {
        return NextResponse.json(
          { error: `La case ${boxNum} est déjà réservée` },
          { status: 400 }
        );
      }
    }

    // Insérer l'utilisateur
    const userResult = await client.execute({
      sql: 'INSERT INTO users (name, phone) VALUES (?, ?) RETURNING id',
      args: [name, phone]
    });

    const userId = userResult.rows[0].id;

    // Réserver les cases
    for (const boxNum of selectedBoxes) {
      await client.execute({
        sql: 'UPDATE boxes SET reserved = 1, user_id = ? WHERE number = ?',
        args: [userId, boxNum]
      });
    }

    return NextResponse.json({
      success: true,
      message: `Réservation confirmée pour ${selectedBoxes.length} case(s)`
    });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réservation' },
      { status: 500 }
    );
  }
}
