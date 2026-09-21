import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Respuestas falsas con la misma forma que devuelve nuestra API
function respuestaOk(texto) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      role: 'assistant',
      content: [{ type: 'text', text: texto }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 100, output_tokens: 20 },
    }),
  };
}

function respuestaError(status) {
  return {
    ok: false,
    status,
    json: async () => ({ error: { type: 'upstream_error', message: 'fallo' } }),
  };
}

// El historial vive en el modulo, asi que cada test necesita un motor nuevo.
// resetModules lo vuelve a evaluar de cero: sin esto, un test arrastraria
// los mensajes del anterior y el resultado dependeria del orden.
async function motorLimpio() {
  vi.resetModules();
  return import('../src/engine/chatEngine.js');
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());   // fetch falso: no sale a la red
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('sendMessage', () => {
  it('guarda el mensaje del usuario y la respuesta de Susana', async () => {
    fetch.mockResolvedValue(respuestaOk('Que necesitas!'));
    const { sendMessage, getState } = await motorLimpio();

    const resultado = await sendMessage('hola');

    expect(resultado.ok).toBe(true);
    expect(getState().messages).toEqual([
      { role: 'user', content: 'hola' },
      { role: 'assistant', content: 'Que necesitas!', truncated: false },
    ]);
    expect(getState().status).toBe('idle');
  });

  it('no llama a la API si el mensaje esta vacio', async () => {
    const { sendMessage } = await motorLimpio();

    const resultado = await sendMessage('   ');

    expect(resultado).toEqual({ ok: false, reason: 'EMPTY' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('deshace el mensaje del usuario si el pedido falla', async () => {
    fetch.mockResolvedValue(respuestaError(502));
    const { sendMessage, getState } = await motorLimpio();

    const resultado = await sendMessage('hola');

    expect(resultado.ok).toBe(false);
    expect(resultado.text).toBe('hola');       // vuelve al input
    expect(getState().messages).toEqual([]);   // el historial queda limpio
    expect(getState().status).toBe('error');
  });
});
