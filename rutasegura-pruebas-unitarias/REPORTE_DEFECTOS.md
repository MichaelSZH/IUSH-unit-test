# Reporte de defectos — RutaSegura

Integrantes:
- Michael Zuleta
-

Reporten aquí cada prueba que falla porque el código no cumple la especificación. Copien el bloque por cada defecto.

---

### DEF-01 — El tráfico reduce el ETA

| Campo | Detalle |
|---|---|
| Regla incumplida (RN-XX) | RN-01: el factor de tráfico debe aumentar el tiempo. |
| Función | `calcularMinutosEstimados` |
| Prueba que lo detecta (nombre exacto del `it`) | `calcularMinutosEstimados_conTrafico_debeMultiplicarYRedondearHaciaArriba` |
| Datos de entrada | Velocidad 40 km/h, distancia 10 km, factor 1.5. |
| Resultado esperado (según README) | 23 minutos: (10 / 40) × 60 × 1.5 = 22.5, redondeado hacia arriba. |
| Resultado obtenido | 10 minutos. El caso del factor máximo también esperaba 3 y obtuvo 1. |
| Severidad (Alta / Media / Baja) y por qué | Alta: subestima el tiempo de llegada y afecta la información que reciben los acudientes. |
| Falla que vería el usuario final (acudiente, conductor o coordinación) | El acudiente ve una llegada anticipada aunque haya congestión. |
| Causa probable en el código (línea / condición) | `src/eta.ts`: `minutosSinTrafico / factorTrafico` divide cuando RN-01 exige multiplicar. |

### DEF-02 — Se rechazan latitudes válidas en los extremos

| Campo | Detalle |
|---|---|
| Regla incumplida (RN-XX) | RN-06: el rango de latitud [-90, 90] incluye ambos límites. |
| Función | `validarCoordenadas` |
| Prueba que lo detecta (nombre exacto del `it`) | `validarCoordenadas_conLatitudMinimaIncluida_debeRetornarTrue` y `validarCoordenadas_conLatitudMaximaIncluida_debeRetornarTrue` |
| Datos de entrada | (-90, 0) y (90, 0). |
| Resultado esperado (según README) | `true` para ambas coordenadas. |
| Resultado obtenido | `false` para ambas. |
| Severidad (Alta / Media / Baja) y por qué | Media: posiciones GPS válidas en los polos son descartadas. |
| Falla que vería el usuario final (acudiente, conductor o coordinación) | Una ubicación válida en un extremo del rango aparece como inválida y puede impedir actualizar la posición del bus. |
| Causa probable en el código (línea / condición) | `src/validaciones.ts`: latitud se compara estrictamente con `> -90` y `< 90`, excluyendo los extremos. |

### DEF-03 — Alerta grave comienza en el límite equivocado

| Campo | Detalle |
|---|---|
| Regla incumplida (RN-XX) | RN-08: hasta 15 minutos, incluido, la alerta debe ser `LEVE`. |
| Función | `determinarNivelAlerta` |
| Prueba que lo detecta (nombre exacto del `it`) | `determinarNivelAlerta_conQuinceMinutos_debeRetornarLeve` |
| Datos de entrada | Retraso de 15 minutos. |
| Resultado esperado (según README) | `LEVE`. |
| Resultado obtenido | `GRAVE`. |
| Severidad (Alta / Media / Baja) y por qué | Media: comunica una categoría de riesgo más alta que la definida para el retraso. |
| Falla que vería el usuario final (acudiente, conductor o coordinación) | La coordinación recibe una alerta grave prematura y puede escalar innecesariamente la situación. |
| Causa probable en el código (línea / condición) | `src/alertas.ts`: la condición `minutosRetraso >= 15` incluye 15 en `GRAVE`; la regla exige `> 15`. |

### DEF-04 — Se envían SMS a acudientes inactivos

| Campo | Detalle |
|---|---|
| Regla incumplida (RN-XX) | RN-11: solo se envían SMS a acudientes con `notificacionesActivas === true`. |
| Función | `NotificadorAcudientes.notificarProximidad` |
| Prueba que lo detecta (nombre exacto del `it`) | `notificarProximidad_conAcudienteConNotificacionesDesactivadas_noDebeEnviarleSMS` |
| Datos de entrada | Un acudiente con notificaciones desactivadas; 5 minutos estimados. |
| Resultado esperado (según README) | 0 envíos y ninguna llamada a `enviarSMS`. |
| Resultado obtenido | 1 envío exitoso; el mock confirma que se llamó al servicio. Con un activo y uno inactivo se obtuvieron 2 envíos en vez de 1. |
| Severidad (Alta / Media / Baja) y por qué | Alta: no se respeta la preferencia explícita de notificaciones del acudiente. |
| Falla que vería el usuario final (acudiente, conductor o coordinación) | Un acudiente recibe SMS aunque desactivó las notificaciones. |
| Causa probable en el código (línea / condición) | `src/notificador.ts`: el ciclo envía a cada acudiente sin comprobar `notificacionesActivas`. |

---
