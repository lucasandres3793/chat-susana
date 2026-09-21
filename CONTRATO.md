# Contrato del chat engine

Formato basado en la Messages API de Anthropic. Es el contrato entre el
front y nuestra propia API: en produccion, la funcion serverless lo
traduce al formato del proveedor (Gemini).

## Request

- model (string): modelo a usar.
- system (string): instrucciones globales del personaje. Va en el nivel
  superior, NO como un mensaje dentro de messages.
- max_tokens (number): techo de tokens de la respuesta. Corta, no resume.
- temperature (number): variabilidad de la respuesta.
- messages (array): historial completo, en orden. Cada item:
  - role: "user" o "assistant" (nunca "system").
  - content: string con el texto.

Reglas de validacion:
- messages no puede estar vacio.
- Los roles alternan y el ultimo mensaje es del usuario.
- Ningun content puede estar vacio.
- La API no guarda estado: cada request reenvia el historial completo.

## Response OK

- role: "assistant".
- content (ARRAY, no string): bloques con type y text. Hay que filtrar
  los de type "text" y unir su contenido.
- stop_reason: por que termino. "end_turn" es normal; "max_tokens"
  significa que la respuesta quedo cortada.
- usage: input_tokens y output_tokens, para medir costo.

## Response 429 (rate limit)

- status: 429.
- retryAfterSeconds: cuantos segundos esperar antes de reintentar.
- error.type: "rate_limit_error".
- error.message: descripcion.

Politica: esperar retryAfterSeconds, reintentar una sola vez; si vuelve
a fallar, mostrar un error claro al usuario.

## Rutas a los datos

- Texto de la respuesta: content[i].text, con content[i].type === "text"
- Motivo de corte: stop_reason
- Espera en 429: retryAfterSeconds
