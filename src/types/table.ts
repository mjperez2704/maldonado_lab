import { Antibiotic } from "./antibiotic";

/**
 * Define la dirección de ordenamiento para las columnas de la tabla.
 * 'asc' para ascendente, 'desc' para descendente.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Configuración para el ordenamiento de la tabla.
 * key: La columna por la cual se está ordenando (debe ser una clave de la interfaz Antibiotic).
 * direction: La dirección del ordenamiento.
 */
export interface SortConfig {
  key: keyof Antibiotic;
  direction: SortDirection;
}

/**
 * Define el estado de la paginación para controlar la tabla.
 */
export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}