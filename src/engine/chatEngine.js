// Motor del chat: historial, payload, pedido, normalizacion y errores.
// No toca el DOM: cuando algo cambia, avisa a los suscriptores.
import { postChat } from './api.js';

const state = {
  messages: [],       // { role: 'user' | 'assistant', content, truncated? }
  status: 'idle',     // 'idle' | 'loading' | 'retrying' | 'error'
  error: null,        // { code, message }
  retryIn: 0,         // segundos de espera durante un 429
  lastUsage: null,    // tokens del ultimo pedido
};

const listeners = [];

export function subscribe(listener) {
  listeners.push(listener);
}

export function getState() {
  return state;
}

function setState(updates) {
  Object.assign(state, updates);
  listeners.forEach((listener) => listener(state));
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function crearError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

// El historial viaja COMPLETO: el modelo no recuerda nada entre pedidos.
// El map deja solo role y content: campos internos como truncated no viajan.
export function buildPayload(messages) {
  return {
    messages: messages.map(({ role, content }) => ({ role, content })),
  };
}

// content es un array de bloques: se filtran los de texto y se unen.
export function normalizeResponse(body) {
  const content = body?.content;
  let text = '';

  if (typeof content === 'string') {
    text = content;
  } else if (Array.isArray(content)) {
    text = content
      .filter((bloque) => bloque?.type === 'text' && typeof bloque.text === 'string')
      .map((bloque) => bloque.text)
      .join(' ');
  }

  text = text.trim();
  if (!text) {
    throw crearError('EMPTY_RESPONSE', 'La respuesta no trajo texto');
  }

  return {
    text,
    stopReason: body.stop_reason ?? 'unknown',
    usage: body.usage ?? null,
  };
}

// Pide, y ante un 429 espera lo indicado y reintenta UNA sola vez.
async function requestWithRetry(payload) {
  let response = await postChat(payload);

  if (response.status === 429) {
    const body = await response.json();
    const segundos = body.retryAfterSeconds ?? 5;

    setState({ status: 'retrying', retryIn: segundos });
    await esperar(segundos * 1000);
    setState({ status: 'loading', retryIn: 0 });

    response = await postChat(payload);
    if (response.status === 429) {
      throw crearError('RATE_LIMIT', 'Limite de pedidos excedido');
    }
  }

  if (!response.ok) {
    throw crearError('HTTP', `HTTP ${response.status}`);
  }

  return response.json();
}

export async function sendMessage(text) {
  const limpio = text.trim();

  if (!limpio) {
    return { ok: false, reason: 'EMPTY' };
  }

  // UI lock: mientras hay un pedido en curso, no entra otro
  if (state.status === 'loading' || state.status === 'retrying') {
    return { ok: false, reason: 'BUSY' };
  }

  state.messages.push({ role: 'user', content: limpio });
  setState({ status: 'loading', error: null });

  try {
    const body = await requestWithRetry(buildPayload(state.messages));
    const { text: respuesta, stopReason, usage } = normalizeResponse(body);

    state.messages.push({
      role: 'assistant',
      content: respuesta,
      truncated: stopReason === 'max_tokens',
    });
    setState({ status: 'idle', lastUsage: usage });
    return { ok: true };

  } catch (error) {
    // Deshacer: si queda el mensaje del usuario, el proximo envio
    // tendria dos mensajes de usuario seguidos
    state.messages.pop();
    setState({
      status: 'error',
      error: { code: error.code ?? 'NETWORK', message: error.message },
    });
    return { ok: false, reason: error.code ?? 'NETWORK', text: limpio };
  }
}
