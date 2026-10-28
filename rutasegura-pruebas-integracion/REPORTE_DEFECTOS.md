# Reporte de defectos de integración — RutaSegura v1.1

Integrantes:
- Michael Zuleta
- Código: 202010381

Reporten aquí cada prueba que falla porque el código no cumple la especificación. Copien el bloque por cada defecto.

---

### DEF-INT-01 — No se convierte la velocidad de m/s a km/h

| Campo | Detalle |
|---|---|
| Regla incumplida (RN-XX) | RN-18: la velocidad del GPS viene en m/s y debe convertirse a km/h multiplicando por 3.6 antes de calcular el ETA. |
| Módulos involucrados (¿qué interfaz falla?) | `ProveedorGPS` entrega `velocidadMs`; `MonitorRuta` la adapta para `eta`. Falla la interfaz de unidades entre el GPS y el cálculo de ETA. |
| Estrategia y nivel que lo detectó (top-down N1/N2, bottom-up) | Top-down nivel 1 y nivel 2. |
| Prueba que lo detecta (nombre exacto del `it`) | `monitorear_conVelocidadEnMetrosPorSegundo_debeConvertirlaAKmhAntesDeCalcularETA`; también `monitorear_debeEntregarAlNotificadorLaPlacaLosMinutosYLosAcudientesDeLaRuta`, `monitorear_debeEnviarSMSConLosMinutosCalculadosPorEtaYNoOtros` y `monitorear_conBusLejosAMasDeDiezMinutos_noDebeEnviarNingunSMS`. |
| Stubs / drivers usados y cómo se configuraron | `ProveedorGPSStub` con `BUS_CERCA` a `10 m/s` y `BUS_LEJOS` a `5 m/s`; `ServicioTraficoStub` con factor `1.0`; `NotificadorStub` o `MensajeriaStub` según el nivel. |
| Resultado esperado (según README) | `10 m/s = 36 km/h`; para 1.322 km y factor 1.0, ETA `3` minutos. Para BUS_LEJOS a `5 m/s = 18 km/h`, ETA `12` minutos. |
| Resultado obtenido | El monitor usa directamente el valor m/s como si fuera km/h: `8` minutos para BUS_CERCA y `40` para BUS_LEJOS. |
| ¿Lo habrían detectado las pruebas unitarias? ¿Por qué? | No necesariamente. Las pruebas unitarias de `eta` reciben explícitamente una velocidad en km/h y pueden pasar. El defecto está en el adaptador de datos dentro de `MonitorRuta`. |
| Severidad (Alta / Media / Baja) y por qué | Alta: altera la ETA y puede enviar información incorrecta a los acudientes; además cambia si se activa la notificación de proximidad. |
| Falla que vería el usuario final (acudiente, conductor o coordinación) | El acudiente recibe una ETA incorrecta en el SMS o no recibe el aviso cuando el bus sí está cerca. |
| Causa probable en el código (línea / condición) | `src/monitorRuta.ts`, línea de la asignación `const velocidadKmh = posicion.velocidadMs;`; debe convertir con `posicion.velocidadMs * 3.6`. |

### DEF-INT-02 — El retraso adelantado se envía como negativo a alertas

| Campo | Detalle |
|---|---|
| Regla incumplida (RN-XX) | RN-20: el retraso nunca puede ser negativo; si el bus llega adelantado, el retraso debe ser `0` y la alerta `NINGUNA`. |
| Módulos involucrados (¿qué interfaz falla?) | `MonitorRuta` calcula la diferencia entre fechas y `alertas.determinarNivelAlerta` recibe un valor negativo que su contrato rechaza. Falla la interfaz de dominio entre ambos módulos. |
| Estrategia y nivel que lo detectó (top-down N1/N2, bottom-up) | Top-down nivel 1. |
| Prueba que lo detecta (nombre exacto del `it`) | `monitorear_conBusQueLlegaAntesDeLaHoraProgramada_debeReportarRetrasoCeroYAlertaNinguna`. |
| Stubs / drivers usados y cómo se configuraron | `ProveedorGPSStub` con BUS_CERCA a `10 m/s`, tráfico `1.0`, ruta programada a las `06:45` y hora actual `06:30`. |
| Resultado esperado (según README) | ETA de `3` minutos, llegada `06:33`, retraso `0`, nivel `NINGUNA`. |
| Resultado obtenido | La diferencia produce `-12` minutos y `determinarNivelAlerta` lanza `RangeError: El retraso no puede ser negativo`. |
| ¿Lo habrían detectado las pruebas unitarias? ¿Por qué? | No. Las unidades pueden ser correctas individualmente: `alertas` debe rechazar retrasos negativos y `eta` calcula la fecha. El defecto aparece al conectar el resultado de fechas con la regla de retraso de negocio. |
| Severidad (Alta / Media / Baja) y por qué | Alta: un bus adelantado provoca un error del monitoreo en lugar de generar un reporte válido. |
| Falla que vería el usuario final (acudiente, conductor o coordinación) | El seguimiento puede fallar o no mostrar el estado de la ruta cuando el bus llega antes de lo programado. |
| Causa probable en el código (línea / condición) | `src/monitorRuta.ts`, cálculo de `minutosRetraso`: falta aplicar `Math.max(0, ...)` antes de llamar a `determinarNivelAlerta`. |

### Evidencia de pruebas relacionadas

El defecto de conversión también provoca que el nivel 2 construya mensajes con
`8` minutos en vez de `3`, por lo que la falla se vuelve visible para el
acudiente. La prueba de SMS lejano recibe `40` en vez de `12`; ambos valores
superan el umbral, por lo que el comportamiento de no enviar SMS sigue siendo
correcto, pero el dato reportado demuestra la conversión incorrecta.

---
