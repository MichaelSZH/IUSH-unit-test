import { calcularMinutosEstimados, calcularHoraEstimadaLlegada } from '../src/eta';

describe('RN-01 calcularMinutosEstimados - fórmula', () => {
  it('calcularMinutosEstimados_conTrafico_debeMultiplicarYRedondearHaciaArriba', () => {
    expect(calcularMinutosEstimados(40, 10, 1.5)).toBe(23);
  });

  it('calcularMinutosEstimados_conResultadoEntero_debeRetornarEseMinuto', () => {
    expect(calcularMinutosEstimados(60, 2, 1)).toBe(2);
  });
});

describe('RN-02 calcularMinutosEstimados - bus detenido / en paradero', () => {
  it('calcularMinutosEstimados_conDistanciaCeroYVelocidadCero_debeRetornarCero', () => {
    expect(calcularMinutosEstimados(0, 0, 1)).toBe(0);
  });

  it('calcularMinutosEstimados_conVelocidadCeroYDistanciaPositiva_debeRetornarNull', () => {
    expect(calcularMinutosEstimados(0, 5, 1)).toBeNull();
  });
});

describe('RN-03 calcularMinutosEstimados - datos negativos', () => {
  it('calcularMinutosEstimados_conVelocidadNegativa_debeLanzarRangeError', () => {
    expect(() => calcularMinutosEstimados(-1, 5, 1)).toThrow(RangeError);
  });

  it('calcularMinutosEstimados_conDistanciaNegativa_debeLanzarRangeError', () => {
    expect(() => calcularMinutosEstimados(40, -1, 1)).toThrow(RangeError);
  });
});

describe('RN-04 calcularMinutosEstimados - rango del factor de tráfico', () => {
  it('calcularMinutosEstimados_conFactorEnLimiteInferior_debeCalcular', () => {
    expect(calcularMinutosEstimados(60, 2, 1)).toBe(2);
  });

  it('calcularMinutosEstimados_conFactorEnLimiteSuperior_debeCalcular', () => {
    expect(calcularMinutosEstimados(60, 3, 3)).toBe(3);
  });

  it('calcularMinutosEstimados_conFactorMenorAlMinimo_debeLanzarRangeError', () => {
    expect(() => calcularMinutosEstimados(60, 2, 0.9)).toThrow(RangeError);
  });

  it('calcularMinutosEstimados_conFactorMayorAlMaximo_debeLanzarRangeError', () => {
    expect(() => calcularMinutosEstimados(60, 2, 3.1)).toThrow(RangeError);
  });
});

describe('RN-05 calcularHoraEstimadaLlegada', () => {
  it('calcularHoraEstimadaLlegada_conDatosNormales_debeSumarMinutosAHoraActual', () => {
    const horaActual = new Date(2026, 8, 22, 6, 30);

    expect(calcularHoraEstimadaLlegada(40, 10, 1.5, horaActual)).toEqual(
      new Date(2026, 8, 22, 6, 53)
    );
  });

  it('calcularHoraEstimadaLlegada_conBusDetenido_debeRetornarNull', () => {
    expect(calcularHoraEstimadaLlegada(0, 5, 1, new Date(2026, 8, 22, 6, 30))).toBeNull();
  });

  it('calcularHoraEstimadaLlegada_sinModificarHoraActual_debeRetornarUnaFechaNueva', () => {
    const horaActual = new Date(2026, 8, 22, 6, 30);
    const valorOriginal = horaActual.getTime();

    const resultado = calcularHoraEstimadaLlegada(60, 2, 1, horaActual);

    expect(resultado).toEqual(new Date(2026, 8, 22, 6, 32));
    expect(resultado).not.toBe(horaActual);
    expect(horaActual.getTime()).toBe(valorOriginal);
  });

  it('calcularHoraEstimadaLlegada_conVelocidadNegativa_debePropagarRangeError', () => {
    expect(() => calcularHoraEstimadaLlegada(-1, 5, 1, new Date(2026, 8, 22, 6, 30))).toThrow(
      RangeError
    );
  });
});
