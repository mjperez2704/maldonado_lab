export interface Antibiotico {
  id: number;
  nombre: string;
  abreviatura: string;
  nombreComercial: string | null;
  viaAdministracion: string;
  presentacion: string | null;
  laboratorio: string | null;
}