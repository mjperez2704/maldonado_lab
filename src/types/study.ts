
export interface ParametroEstudio {
    id: number;
    estudio_id: number;
    nombre_parametro: string;
    costo: number;
    factor_conversion: string;
    unidad_medida: string;
    unidad_internacional: string;
}

export interface ValoresReferencia {
    id: number;
    parametro_id: number;
    estudio_id: number;
    tipo_referencia: 'Intervalo' | 'Mixto' | 'Criterio' | 'Sin_referencia';
    sexo: 'Ambos' | 'Masculino' | 'Femenino';
    edad_inicio: number;
    edad_fin: number;
    unidad_edad: 'Anos' | 'Meses' | 'Dias';
    valor_inicio: string;
    valor_fin: string;
    texto_criterio: string;
    // Este campo almacenará el JSON como un string
    posibles_valores: string; 
    texto_reporte_resultados: string;
}

// Interfaz para el estado del formulario en el frontend
export interface PosiblesValoresForm {
    valores_opciones: string[];
    valor_predeterminado: string;
    valor_referencia: string;
}


export interface IntegratedEstudioRef {
    id: number;
    nombre: string;
}

export interface MuestraEstudio {
    type: string;
    container: string;
    indications: string;
    cost: number;
}

// Representa el estado del parámetro en el formulario del frontend
export type ParametroEstudioForm = Omit<ParametroEstudio, 'id' | 'estudio_id'> & {
    valoresReferencia: Omit<ValoresReferencia, 'id' | 'parametro_id' | 'estudio_id' | 'posibles_valores'> & {
        // Usamos la interfaz del formulario para manejar los posibles valores
        posibles_valores_form: PosiblesValoresForm; 
    };
};


export interface Estudio {
    id: number;
    area: string;
    codigo: string;
    nombre: string;
    metodo: string;
    costoInterno: number;
    precio: number;
    tiempoEntrega: number;
    unidadEntrega: 'dias' | 'horas';
    tiempoProceso: string;
    diasProceso: string;
    indicaciones: string;
    esSubcontratado: boolean;
    laboratorio_externo_id: string;
    codigoExterno: string;
    costoExterno: number;
    tiempoEntregaExterno: string;
    leyenda: string;
    descripcionCientifica: string;
    claveServicioSat: string;
    claveUnidadSat: string;
    // Se utiliza la interfaz de formulario para los parámetros
    parameters: ParametroEstudioForm[];
    configuracion: {
        showInRequest: boolean;
        canUploadDocuments: boolean;
        printLabSignature: boolean;
        printWebSignature: boolean;
        hasEnglishHeaders: boolean;
        printWithParams: boolean;
        generateWorkOrder: boolean;
    };
    tieneSubestudios: boolean;
    esPaquete: boolean;
    tipo_muestra_id: string;
    categoria_id: string;
    abreviatura: string;
    integratedStudies: IntegratedEstudioRef[];
    sinonimo: string[];
    muestras: MuestraEstudio[];
}
