import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso';

export async function GET() {
  try {
    const client = getTursoClient();

    const result = await client.execute(`
      SELECT
        boxes.id,
        boxes.number,
        boxes.reserved,
        users.name as user_name,
        users.phone as user_phone
      FROM boxes
      LEFT JOIN users ON boxes.user_id = users.id
      ORDER BY boxes.number
    `);

    return NextResponse.json({ boxes: result.rows });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des cases' },
      { status: 500 }
    );
  }
}
