export interface Antibiotic {
  id: number;
  name: string;
  shortcut: string;
  commercialName: string | null;
  administrationRoute: string;
  presentation: string | null;
  laboratory: string | null;
}