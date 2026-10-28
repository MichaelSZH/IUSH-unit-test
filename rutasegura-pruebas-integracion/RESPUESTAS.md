# Respuestas del taller — RutaSegura (Integración)

Integrantes:
- Michael Zuleta
- Código: 202010381

## Ejercicio 1 — Orden de integración

Dibujen (o describan) el orden en que integrarían los módulos de RutaSegura con cada estrategia, indicando en cada paso qué stubs o drivers se necesitan.

| Paso | Top-down: módulos reales | Stubs necesarios | Bottom-up: módulos reales | Drivers necesarios |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**Respuesta:**

| Paso | Top-down: módulos reales | Stubs necesarios | Bottom-up: módulos reales | Drivers necesarios |
|---|---|---|---|---|
| 1 | `MonitorRuta` | GPS, repositorio, tráfico y notificador | `geo`, `eta`, `alertas` | `driverCalculoLlegada` |
| 2 | `MonitorRuta` + `NotificadorAcudientes` | GPS, repositorio, tráfico y mensajería | `eta` + `NotificadorAcudientes` | `driverNotificacion` y `MensajeriaStub` |
| 3 | Sistema integrado | Solo dependencias externas, si aún no existen | `MonitorRuta` real con módulos internos | Los drivers se reemplazan por el módulo real |

## Preguntas

**1.** Un stub reemplaza a un componente que está debajo del módulo bajo prueba.
Entrega respuestas controladas y puede registrar las llamadas. Por ejemplo,
`ProveedorGPSStub` reemplaza al GPS que `MonitorRuta` llama. Un driver hace el
papel del componente superior que todavía no existe: prepara datos y llama a
los módulos inferiores. `driverCalculoLlegada` reemplaza temporalmente a
`MonitorRuta` y llama a `geo`, `eta` y `alertas`. En resumen, el stub está
debajo del módulo bajo prueba y el driver está encima de los módulos que se
están integrando.

**2.** Las pruebas unitarias verifican cada función de manera aislada, pero no
siempre verifican la traducción de datos entre módulos. Encontramos que
`ProveedorGPS` entrega velocidad en m/s, mientras `MonitorRuta` la pasó
directamente a `eta`, que espera km/h. Por eso `10 m/s` se interpretó como
`10 km/h` y la ETA resultó `8` en vez de `3`. Las unidades individuales podían
pasar, pero la interfaz entre ellas era incorrecta.

**3.** Un defecto en la construcción del mensaje o en el filtro de acudientes
puede pasar desapercibido en nivel 1 porque `NotificadorStub` solo registra la
llamada y retorna una cantidad fija. En nivel 2, `NotificadorAcudientes` real
usa `MensajeriaStub`, y se puede verificar el texto exacto, los teléfonos y
los envíos exitosos. En este taller, el error de unidades también se volvió
visible: nivel 1 detectó la ETA `8` frente a `3`, y nivel 2 demostró que el
acudiente recibiría esos `8` minutos en el SMS.

**4.** El stub podría ocultar errores de contrato y producir una falsa
confianza. Si devolviera km/h cuando el hardware real entrega m/s, una prueba
podría pasar aunque el sistema real fallara. Se mitiga documentando los
contratos, usando nombres explícitos como `velocidadMs`, probando conversiones
con valores calculados independientemente y repitiendo pruebas con el
componente real o pruebas de contrato cuando esté disponible.

**5.** `npm run driver` es útil para una demostración rápida y para observar
varios escenarios en una tabla. Sin embargo, `calculoLlegada.test.ts` tiene
aserciones automáticas, nombres de casos, aislamiento y evidencia reproducible
en CI. El driver de consola es útil para explorar manualmente o presentar el
flujo, pero no reemplaza una prueba automatizada porque un humano debe revisar
la salida.

**6.** Bottom-up encontró que `geo`, `eta` y `alertas` se encadenaban bien en
los escenarios definidos, y también verificó `eta` con el notificador. Los dos
defectos propios de la integración del orquestador aparecieron primero en
top-down: la conversión m/s-km/h en RN-18 y el retraso negativo en RN-20.
Top-down fue la estrategia adecuada porque permitió controlar el GPS, el
tráfico y las fechas, y observar el resultado de `MonitorRuta` junto con las
interacciones de sus colaboradores.

**7.** `ServicioTraficoStub` entregó factores conocidos y también simuló una
caída. Esto permitió probar RN-17 sin depender del otro equipo ni de una red.
Cuando exista el servicio real se deben repetir los casos de factor normal,
factor dentro del rango, error o timeout y compatibilidad del contrato de
coordenadas y unidades. El stub seguirá siendo útil para pruebas rápidas y
deterministas.

**8.** Una hora fija hace que las pruebas sean repetibles. Con `new Date()`,
el resultado dependería del momento real de ejecución y podría cambiar entre
máquinas o cruzar un minuto durante la prueba. La comparación de retraso usa
fechas absolutas: la prueba diseñada para las 6:30 a. m. no conservaría el
escenario si se ejecutara a las 2:00 p. m.; cambiaría la hora de llegada
calculada y el significado del retraso frente a la hora programada.

**9.** Habría fallado el flujo completo, pero sería más difícil aislar la
causa: no sabríamos inicialmente si el problema estaba en GPS, conversión,
ETA, fechas, alertas, tráfico o SMS. Con top-down y bottom-up se controla un
nivel a la vez y se observa si el valor se transforma mal al cruzar una
interfaz.

**10.**

- **Conversión de velocidad:** error: interpretar `velocidadMs` como km/h →
  defecto: `MonitorRuta` asigna directamente `posicion.velocidadMs` a
  `velocidadKmh` → falla: ETA `8` en vez de `3` y SMS con minutos incorrectos.
  Es un defecto de interfaz entre GPS y ETA.
- **Retraso negativo:** error: permitir que la diferencia de fechas sea
  negativa → defecto: `MonitorRuta` no aplica el límite inferior cero →
  falla: `determinarNivelAlerta` recibe `-12` y lanza `RangeError`. Es un
  defecto de interfaz entre el orquestador y alertas.

Las funciones aisladas no necesariamente fallan: el GPS cumple su contrato,
ETA calcula correctamente si recibe km/h y alertas correctamente rechaza
retrasos negativos. El error está en cómo `MonitorRuta` conecta los contratos.
