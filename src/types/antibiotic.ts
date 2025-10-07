export interface Antibiotic {
  id: number;
  nombre: string;
  nombreCorto: string;
  nombreComercial: string | null;
  viaAdministracion: string;
  presentacion: string | null;
  laboratorio: string | null;
}