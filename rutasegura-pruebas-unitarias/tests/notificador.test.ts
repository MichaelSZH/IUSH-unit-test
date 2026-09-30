import { NotificadorAcudientes, ServicioMensajeria, Acudiente } from '../src/notificador';

let mensajeria: jest.Mocked<ServicioMensajeria>;
let notificador: NotificadorAcudientes;

const acudienteActivo: Acudiente = {
  nombre: 'Ana',
  telefono: '3001112233',
  notificacionesActivas: true,
};

beforeEach(() => {
  mensajeria = { enviarSMS: jest.fn().mockResolvedValue(true) };
  notificador = new NotificadorAcudientes(mensajeria);
});

describe('RN-10 notificarProximidad - umbral de minutos', () => {
  it('notificarProximidad_conBusAMasDeDiezMinutos_noDebeEnviarSMS', async () => {
    await expect(notificador.notificarProximidad('ABC123', 11, [acudienteActivo])).resolves.toBe(0);
    expect(mensajeria.enviarSMS).not.toHaveBeenCalled();
  });

  it('notificarProximidad_conMinutosNull_noDebeEnviarSMS', async () => {
    await expect(notificador.notificarProximidad('ABC123', null, [acudienteActivo])).resolves.toBe(0);
    expect(mensajeria.enviarSMS).not.toHaveBeenCalled();
  });

  it('notificarProximidad_conDiezMinutos_debeEnviarSMS', async () => {
    await expect(notificador.notificarProximidad('ABC123', 10, [acudienteActivo])).resolves.toBe(1);
    expect(mensajeria.enviarSMS).toHaveBeenCalledTimes(1);
  });
});

describe('RN-11 notificarProximidad - preferencias del acudiente', () => {
  it('notificarProximidad_conAcudienteConNotificacionesDesactivadas_noDebeEnviarleSMS', async () => {
    const acudienteInactivo = { ...acudienteActivo, notificacionesActivas: false };

    await expect(notificador.notificarProximidad('ABC123', 5, [acudienteInactivo])).resolves.toBe(0);
    expect(mensajeria.enviarSMS).not.toHaveBeenCalled();
  });

  it('notificarProximidad_conAcudientesActivosEInactivos_soloEnviaAlActivo', async () => {
    const acudienteInactivo = {
      ...acudienteActivo,
      telefono: '3009998877',
      notificacionesActivas: false,
    };

    await expect(
      notificador.notificarProximidad('ABC123', 5, [acudienteActivo, acudienteInactivo])
    ).resolves.toBe(1);
    expect(mensajeria.enviarSMS).toHaveBeenCalledTimes(1);
    expect(mensajeria.enviarSMS).toHaveBeenCalledWith(
      acudienteActivo.telefono,
      'RutaSegura: el bus ABC123 llegará en aproximadamente 5 minutos.'
    );
  });
});

describe('RN-12 notificarProximidad - contenido del mensaje', () => {
  it('notificarProximidad_debeEnviarMensajeConPlacaYMinutos', async () => {
    await notificador.notificarProximidad('WPX482', 7, [acudienteActivo]);

    expect(mensajeria.enviarSMS).toHaveBeenCalledWith(
      '3001112233',
      'RutaSegura: el bus WPX482 llegará en aproximadamente 7 minutos.'
    );
  });
});

describe('RN-13 notificarProximidad - tolerancia a fallos', () => {
  it('notificarProximidad_conUnEnvioFallido_debeContinuarYContarSoloExitosos', async () => {
    const acudientes = [
      acudienteActivo,
      { ...acudienteActivo, telefono: '3002223344' },
      { ...acudienteActivo, telefono: '3003334455' },
    ];
    mensajeria.enviarSMS
      .mockRejectedValueOnce(new Error('Sin señal'))
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await expect(notificador.notificarProximidad('ABC123', 5, acudientes)).resolves.toBe(1);
    expect(mensajeria.enviarSMS).toHaveBeenCalledTimes(3);
    expect(mensajeria.enviarSMS).toHaveBeenNthCalledWith(
      3,
      '3003334455',
      'RutaSegura: el bus ABC123 llegará en aproximadamente 5 minutos.'
    );
  });
});
