// Unico punto del front que habla con el servidor.
// Devuelve un Response de fetch: ok, status y json(), que es justo la forma
// que el mock de L6 imitaba. Por eso el resto del motor no cambia.
export async function postChat(payload) {
  return fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
