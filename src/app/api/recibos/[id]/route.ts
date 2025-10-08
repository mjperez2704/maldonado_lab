
import { getReciboById } from '@/services/reciboServicio';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const recibo = await getReciboById(id);
    if (!recibo) {
      return new NextResponse('Recibo not found', { status: 404 });
    }
    return NextResponse.json(recibo);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
