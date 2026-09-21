import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from './systemPrompt.js';

// El modelo se configura por variable de entorno: cuando Google retire el
// actual, se cambia en Vercel sin tocar una linea de codigo.
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

// Topes de seguridad: no son gestion de contexto, son proteccion contra
// un pedido armado a mano para quemar la cuota.
const MAX_MENSAJES = 100;
const MAX_CARACTERES = 2000;

function error(res, status, type, message, extra = {}) {
  return res.status(status).json({ status, error: { type, message }, ...extra });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return error(res, 405, 'method_not_allowed', 'Metodo no permitido');
  }

  const { messages } = req.body ?? {};

  // --- Validacion: el servidor decide, nunca confia en el front ---
  if (!Array.isArray(messages) || messages.length === 0) {
    return error(res, 400, 'invalid_request', 'Falta el historial de mensajes');
  }

  if (messages.length > MAX_MENSAJES) {
    return error(res, 400, 'invalid_request', 'Historial demasiado largo');
  }

  for (const m of messages) {
    if (m?.role !== 'user' && m?.role !== 'assistant') {
      return error(res, 400, 'invalid_request', 'Rol invalido en el historial');
    }
    if (typeof m.content !== 'string' || !m.content.trim()) {
      return error(res, 400, 'invalid_request', 'Mensaje vacio en el historial');
    }
    if (m.content.length > MAX_CARACTERES) {
      return error(res, 400, 'invalid_request', 'Mensaje demasiado largo');
    }
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('Falta GEMINI_API_KEY en las variables de entorno');
    return error(res, 500, 'config_error', 'El servidor no esta configurado');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const respuesta = await ai.models.generateContent({
      model: MODEL,

      // Traduccion de nuestro contrato al de Gemini:
      // "assistant" se llama "model", y el texto va dentro de parts[]
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),

      config: {
        // El personaje lo pone el servidor, no el navegador
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.9,     // variedad sin salirse del personaje
        maxOutputTokens: 300, // red de seguridad; el largo lo pide el prompt
      },
    });

    const texto = (respuesta.text ?? '').trim();

    if (!texto) {
      return error(res, 502, 'empty_response', 'El modelo no devolvio texto');
    }

    const finish = respuesta.candidates?.[0]?.finishReason;
    const uso = respuesta.usageMetadata;

    // Traduccion de vuelta a NUESTRO contrato
    return res.status(200).json({
      role: 'assistant',
      content: [{ type: 'text', text: texto }],
      stop_reason: finish === 'MAX_TOKENS' ? 'max_tokens' : 'end_turn',
      usage: {
        input_tokens: uso?.promptTokenCount ?? 0,
        output_tokens: uso?.candidatesTokenCount ?? 0,
      },
    });

  } catch (e) {
    // Gemini corta por limite de uso: lo traducimos al 429 de nuestro contrato
    if (e?.status === 429) {
      return error(res, 429, 'rate_limit_error', 'Rate limit exceeded', {
        retryAfterSeconds: 5,
      });
    }

    console.error('Error llamando a Gemini:', e);
    return error(res, 502, 'upstream_error', 'No se pudo generar la respuesta');
  }
}
