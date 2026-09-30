import { validarCoordenadas } from '../src/validaciones';

describe('RN-06 validarCoordenadas', () => {
  it('validarCoordenadas_conLatitudMinimaIncluida_debeRetornarTrue', () => {
    expect(validarCoordenadas(-90, 0)).toBe(true);
  });

  it('validarCoordenadas_conLatitudMaximaIncluida_debeRetornarTrue', () => {
    expect(validarCoordenadas(90, 0)).toBe(true);
  });

  it('validarCoordenadas_conLatitudDebajoDelMinimo_debeRetornarFalse', () => {
    expect(validarCoordenadas(-90.001, 0)).toBe(false);
  });

  it('validarCoordenadas_conLatitudSobreElMaximo_debeRetornarFalse', () => {
    expect(validarCoordenadas(90.001, 0)).toBe(false);
  });

  it('validarCoordenadas_conLatitudIntermedia_debeRetornarTrue', () => {
    expect(validarCoordenadas(45, 0)).toBe(true);
  });

  it('validarCoordenadas_conLongitudMinimaIncluida_debeRetornarTrue', () => {
    expect(validarCoordenadas(0, -180)).toBe(true);
  });

  it('validarCoordenadas_conLongitudMaximaIncluida_debeRetornarTrue', () => {
    expect(validarCoordenadas(0, 180)).toBe(true);
  });

  it('validarCoordenadas_conLongitudDebajoDelMinimo_debeRetornarFalse', () => {
    expect(validarCoordenadas(0, -180.001)).toBe(false);
  });

  it('validarCoordenadas_conLongitudSobreElMaximo_debeRetornarFalse', () => {
    expect(validarCoordenadas(0, 180.001)).toBe(false);
  });

  it('validarCoordenadas_conLongitudIntermedia_debeRetornarTrue', () => {
    expect(validarCoordenadas(0, 90)).toBe(true);
  });

  it('validarCoordenadas_conLatitudNaN_debeRetornarFalse', () => {
    expect(validarCoordenadas(Number.NaN, 0)).toBe(false);
  });

  it('validarCoordenadas_conLongitudNaN_debeRetornarFalse', () => {
    expect(validarCoordenadas(0, Number.NaN)).toBe(false);
  });
});
