import { determinarNivelAlerta, calcularPorcentajeOcupacion } from '../src/alertas';

describe('RN-08 determinarNivelAlerta', () => {
  it('determinarNivelAlerta_conCeroMinutos_debeRetornarNinguna', () => {
    expect(determinarNivelAlerta(0)).toBe('NINGUNA');
  });

  it('determinarNivelAlerta_conCincoMinutos_debeRetornarNinguna', () => {
    expect(determinarNivelAlerta(5)).toBe('NINGUNA');
  });

  it('determinarNivelAlerta_conMasDeCincoMinutos_debeRetornarLeve', () => {
    expect(determinarNivelAlerta(6)).toBe('LEVE');
  });

  it('determinarNivelAlerta_conQuinceMinutos_debeRetornarLeve', () => {
    expect(determinarNivelAlerta(15)).toBe('LEVE');
  });

  it('determinarNivelAlerta_conMasDeQuinceMinutos_debeRetornarGrave', () => {
    expect(determinarNivelAlerta(16)).toBe('GRAVE');
  });

  it('determinarNivelAlerta_conRetrasoNegativo_debeLanzarRangeError', () => {
    expect(() => determinarNivelAlerta(-1)).toThrow(RangeError);
  });
});

describe('RN-09 calcularPorcentajeOcupacion', () => {
  it('calcularPorcentajeOcupacion_conBusMedioLleno_debeRetornar50', () => {
    expect(calcularPorcentajeOcupacion(20, 40)).toBe(50);
  });

  it('calcularPorcentajeOcupacion_conDecimalPeriodico_debeRedondearAUnaDecimal', () => {
    expect(calcularPorcentajeOcupacion(1, 3)).toBe(33.3);
  });

  it('calcularPorcentajeOcupacion_conSobrecupo_debeSuperarCienPorCiento', () => {
    expect(calcularPorcentajeOcupacion(12, 10)).toBe(120);
  });

  it('calcularPorcentajeOcupacion_conCapacidadCero_debeLanzarRangeError', () => {
    expect(() => calcularPorcentajeOcupacion(1, 0)).toThrow(RangeError);
  });

  it('calcularPorcentajeOcupacion_conEstudiantesNegativos_debeLanzarRangeError', () => {
    expect(() => calcularPorcentajeOcupacion(-1, 40)).toThrow(RangeError);
  });
});
