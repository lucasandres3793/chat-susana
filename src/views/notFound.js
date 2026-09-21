export const notFoundView = {
  render: () => `
    <section class="not-found">
      <h1>404 - Pagina no encontrada</h1>
      <p>La ruta "${window.location.pathname}" no existe.</p>
      <p><a href="/home">Volver al inicio</a></p>
    </section>
  `,
};
