import { describe, it, expect } from 'vitest';
import { buildPayload, normalizeResponse } from '../src/engine/chatEngine.js';

describe('buildPayload', () => {
  it('manda solo role y content, y descarta los campos internos', () => {
    const messages = [
      { role: 'user', content: 'hola' },
      { role: 'assistant', content: 'que necesitas', truncated: true },
    ];

    expect(buildPayload(messages)).toEqual({
      messages: [
        { role: 'user', content: 'hola' },
        { role: 'assistant', content: 'que necesitas' },
      ],
    });
  });

  it('manda el historial completo, sin recortar', () => {
    const messages = Array.from({ length: 30 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `mensaje ${i}`,
    }));

    expect(buildPayload(messages).messages).toHaveLength(30);
  });
});

describe('normalizeResponse', () => {
  it('une los bloques de texto e ignora los que no lo son', () => {
    const body = {
      content: [
        { type: 'thinking', thinking: 'razonamiento interno' },
        { type: 'text', text: 'Para un poco!' },
        { type: 'text', text: 'No doy mas.' },
      ],
      stop_reason: 'end_turn',
    };

    expect(normalizeResponse(body).text).toBe('Para un poco! No doy mas.');
  });

  it('lanza un error si la respuesta no trae texto', () => {
    const body = { content: [{ type: 'thinking', thinking: 'solo penso' }] };

    expect(() => normalizeResponse(body)).toThrowError(/no trajo texto/);
  });

  it('detecta cuando la respuesta quedo cortada por el limite de tokens', () => {
    const body = {
      content: [{ type: 'text', text: 'Aca estoy, tratando de' }],
      stop_reason: 'max_tokens',
    };

    expect(normalizeResponse(body).stopReason).toBe('max_tokens');
  });
});
