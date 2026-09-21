// Simula la API de chat mientras no exista la funcion serverless.
// Imita la forma de un Response de fetch (ok, status, json()), asi el
// motor lo usa igual que a fetch y en L7 el cambio es minimo.

// Respuestas fijas de Susana: el mock no piensa, solo rota estas.
const RESPUESTAS = [
  '¿Cómo querés que ande? ¡La nena llora y Mamá Cora ya anda revolviendo la cocina!',
  '¡Ay, no me hagas hablar, que tengo la mayonesa en la mesada y la suegra suelta!',
  '¿Y los demás hermanos dónde están? ¡Siempre nosotros, SIEMPRE nosotros!',
  'Mirá, si venís a charlar, charlemos, pero no me pidas que cocine para todos otra vez.',
];

// Modos:
//   'ok'          respuesta normal
//   '429-once'    el primer intento da 429, el reintento sale bien
//   '429-always'  todos los intentos dan 429
//   'multi'       content trae varios bloques, incluido uno que no es texto
let mode = 'ok';
let intentosConLimite = 0;
let turno = 0;

export function setMockMode(nuevoModo) {
  mode = nuevoModo;
  intentosConLimite = 0;
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Estimacion grosera: unos 4 caracteres por token
function contarTokens(texto) {
  return Math.ceil(texto.length / 4);
}

// Arma algo con la misma forma que un Response de fetch
function crearRespuesta(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

export async function mockFetch(payload) {
  await esperar(800);   // latencia simulada: deja ver el estado de carga

  const toca429 =
    mode === '429-always' ||
    (mode === '429-once' && intentosConLimite === 0);

  if (toca429) {
    intentosConLimite++;
    return crearRespuesta(429, {
      status: 429,
      retryAfterSeconds: 3,
      error: { type: 'rate_limit_error', message: 'Rate limit exceeded' },
    });
  }

  const texto = RESPUESTAS[turno % RESPUESTAS.length];
  turno++;

  // El input que se "cobra" es todo lo que viaja: system + historial completo
  const textoDeEntrada =
    payload.system + ' ' + payload.messages.map((m) => m.content).join(' ');

  const content =
    mode === 'multi'
      ? [
          { type: 'thinking', thinking: 'razonamiento interno' },
          { type: 'text', text: '¡Pará un poco!' },
          { type: 'text', text: texto },
        ]
      : [{ type: 'text', text: texto }];

  return crearRespuesta(200, {
    role: 'assistant',
    content,
    stop_reason: 'end_turn',
    usage: {
      input_tokens: contarTokens(textoDeEntrada),
      output_tokens: contarTokens(texto),
    },
  });
}
