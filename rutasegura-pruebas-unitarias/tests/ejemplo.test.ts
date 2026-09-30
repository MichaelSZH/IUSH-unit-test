import { esPlacaValida } from '../src/validaciones';

/**
 * PRUEBA DE EJEMPLO — patrón Arrange / Act / Assert (AAA).
 * Úsenla como guía para escribir las demás. Pueden ampliar este archivo con más casos de RN-07.
 */
describe('RN-07 esPlacaValida', () => {
  it('esPlacaValida_conFormatoEstandar_debeRetornarTrue', () => {
    // Arrange: preparar los datos de entrada
    const placa = 'WPX482';

    // Act: ejecutar la unidad bajo prueba
    const resultado = esPlacaValida(placa);

    // Assert: verificar el resultado contra la especificación
    expect(resultado).toBe(true);
  });

  it('esPlacaValida_conGuionOpcional_debeRetornarTrue', () => {
    expect(esPlacaValida('ABC-123')).toBe(true);
  });

  it('esPlacaValida_conMinusculas_debeRetornarTrue', () => {
    expect(esPlacaValida('abc123')).toBe(true);
  });

  it('esPlacaValida_conEspaciosExternos_debeRetornarTrue', () => {
    expect(esPlacaValida('  ABC-123  ')).toBe(true);
  });

  it('esPlacaValida_conMenosDeTresLetras_debeRetornarFalse', () => {
    expect(esPlacaValida('AB123')).toBe(false);
  });

  it('esPlacaValida_conMasDeTresLetras_debeRetornarFalse', () => {
    expect(esPlacaValida('ABCD123')).toBe(false);
  });

  it('esPlacaValida_conMenosDeTresDigitos_debeRetornarFalse', () => {
    expect(esPlacaValida('ABC12')).toBe(false);
  });

  it('esPlacaValida_conMasDeTresDigitos_debeRetornarFalse', () => {
    expect(esPlacaValida('ABC1234')).toBe(false);
  });

  it('esPlacaValida_conGuionEnPosicionIncorrecta_debeRetornarFalse', () => {
    expect(esPlacaValida('AB-C123')).toBe(false);
  });
});
