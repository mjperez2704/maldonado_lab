
import { getPatientById } from '@/services/pacienteServicio';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const patient = await getPatientById(Number(id));

    if (!patient) {
      return new NextResponse('Patient not found', { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
