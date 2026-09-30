# Respuestas del taller — RutaSegura

Integrantes:
- Michael Zuleta

## Ejercicio 1 — Diseño de casos (RN-01 a RN-04)

| Regla | Entradas (velocidad, distancia, factor) | Resultado esperado (calculado a mano) | Tipo (feliz / límite / error) |
|---|---|---|---|
| RN-01 | (40 km/h, 10 km, 1.5) | (10 / 40) × 60 × 1.5 = 22.5; redondeado hacia arriba: 23 min | Feliz |
| RN-01 | (40 km/h, 10 km, 1.0) | (10 / 40) × 60 × 1.0 = 15 min | Límite inferior del factor |
| RN-01 | (40 km/h, 10 km, 3.0) | (10 / 40) × 60 × 3.0 = 45 min | Límite superior del factor |
| RN-02 | (0 km/h, 0 km, 1.0) | 0 min porque ya está en el paradero | Límite |
| RN-02 | (0 km/h, 5 km, 1.0) | `null` porque el bus está detenido y falta distancia | Límite |
| RN-03 | (-1 km/h, 5 km, 1.0) | Lanza `RangeError` por velocidad negativa | Error |
| RN-03 | (40 km/h, -1 km, 1.0) | Lanza `RangeError` por distancia negativa | Error |
| RN-04 | (60 km/h, 2 km, 1.0) | 2 min; factor mínimo incluido | Límite |
| RN-04 | (60 km/h, 3 km, 3.0) | 3 min; factor máximo incluido | Límite |
| RN-04 | (60 km/h, 2 km, 0.9) | Lanza `RangeError` por debajo del mínimo | Error |
| RN-04 | (60 km/h, 2 km, 3.1) | Lanza `RangeError` por encima del máximo | Error |

La especificación no define errores propios para RN-01 ni RN-02; los errores de datos inválidos están definidos en RN-03 y RN-04.

## Preguntas

Respondan cada pregunta con base en SUS pruebas (citen el nombre del `it` cuando aplique). Respuestas genéricas copiadas de internet no suman puntos.

**1.** En `calcularMinutosEstimados_conTrafico_debeMultiplicarYRedondearHaciaArriba` usamos 40 km/h, 10 km y factor 1.5. La cuenta da 22.5 minutos, que debe redondearse hacia arriba a 23. Escogimos datos que hacen visible el efecto del tráfico y el redondeo. La prueba demuestra ese resultado para esa combinación, pero no demuestra por sí sola que todos los factores, velocidades, distancias o errores estén bien tratados.

**2.** Si en esa misma prueba cambiamos el factor a 1.0, el esperado es 15 minutos. El código actual también devuelve 15 porque dividir y multiplicar por 1.0 no cambia el valor, así que la prueba pasaría incluso con el defecto. Esto enseña que los datos deben distinguir entre implementaciones correctas e incorrectas; el factor 1.5 hace que la división errónea produzca 10 en vez de 23.

**3.** Los extremos revelan errores de inclusión que los valores intermedios no muestran. `validarCoordenadas_conLatitudIntermedia_debeRetornarTrue` pasa con 45, pero las pruebas de -90 y 90 fallan: el código excluye límites que el README incluye. `determinarNivelAlerta_conQuinceMinutos_debeRetornarLeve` también falla porque 15 se clasifica como `GRAVE`, aunque 10 sí pertenece a `LEVE`.

**4.** No. Que pase demuestra que el resultado coincide para el caso probado, no para todos los casos. Por ejemplo, el caso de latitud intermedia pasa, pero los dos límites de latitud fallan. También la prueba ETA con factor 1.0 pasa y no detecta que el código divide el tiempo entre el factor.

**5.** Usamos un mock para que la prueba no envíe SMS reales, sea repetible y permita simular éxito, rechazo y respuesta `false`. `toHaveBeenCalledWith` verifica los argumentos enviados al proveedor (teléfono y texto exactos); el valor de retorno solo indica cuántos envíos fueron exitosos, no a quién ni qué mensaje se intentó enviar.

**6.** `npm run test:coverage` reportó 100 % en líneas, ramas y funciones. Sí, es posible tener 100 % y conservar defectos: nuestra suite ejecuta todo el código de `calcularMinutosEstimados`, pero `calcularMinutosEstimados_conTrafico_debeMultiplicarYRedondearHaciaArriba` falla porque el código divide entre el factor en vez de multiplicar. La cobertura mide ejecución, no que la lógica ejecutada cumpla la especificación.

**7.**

- RN-01: probable equivocación al invertir la operación del factor → `src/eta.ts` divide entre el tráfico → `calcularMinutosEstimados_conTrafico_debeMultiplicarYRedondearHaciaArriba` obtiene 10 en vez de 23 y el acudiente ve una llegada anticipada.
- RN-06: probable omisión de igualdad en los operadores → `src/validaciones.ts` excluye -90 y 90 → las ubicaciones de esos límites se rechazan.
- RN-08: probable error de límite inclusivo → `src/alertas.ts` clasifica 15 como `GRAVE` → la coordinación recibe una alerta más alta antes de lo especificado.
- RN-11: probable omisión del filtro de preferencias → `src/notificador.ts` envía a todos los acudientes → una persona recibe SMS aunque desactivó las notificaciones.

Las pruebas que evidencian esos defectos se llaman `calcularMinutosEstimados_conTrafico_debeMultiplicarYRedondearHaciaArriba`, `validarCoordenadas_conLatitudMinimaIncluida_debeRetornarTrue`, `determinarNivelAlerta_conQuinceMinutos_debeRetornarLeve` y `notificarProximidad_conAcudienteConNotificacionesDesactivadas_noDebeEnviarleSMS`, respectivamente.

**8.** La suite sigue FIRST: **Fast**, el conjunto se ejecuta en segundos; **Independent**, cada test prepara sus datos y `beforeEach` crea un mock nuevo; **Repeatable**, las fechas usan valores fijos como `new Date(2026, 8, 22, 6, 30)`; **Self-validating**, cada test tiene aserciones explícitas; **Timely**, las pruebas se escribieron contra la especificación antes de modificar la implementación. No identificamos pruebas dependientes de hora actual, red o SMS real.

**9.** Conservamos las pruebas como especificación ejecutable y protección de regresiones. Tras corregir el código, las pruebas deben pasar; si dentro de seis meses se vuelve a dividir por el factor de tráfico, el caso de RN-01 fallará de nuevo y señalará el defecto antes de publicar.

**10.** Elegiríamos `calcularMinutosEstimados_conTrafico_debeMultiplicarYRedondearHaciaArriba` porque una ETA incorrecta desinforma a las familias; `notificarProximidad_conAcudienteConNotificacionesDesactivadas_noDebeEnviarleSMS` porque debe respetarse la preferencia del acudiente; y `determinarNivelAlerta_conQuinceMinutos_debeRetornarLeve` porque una alerta mal clasificada puede provocar una respuesta inadecuada de la coordinación.
