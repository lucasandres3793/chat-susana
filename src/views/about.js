export const aboutView = {
  render: () => `
    <section class="about">
      <h1>Sobre este proyecto</h1>

      <h2>Qué es</h2>
      <p>
        Prueba de concepto de una Single Page Application que permite conversar
        con un personaje de ficción usando inteligencia artificial. Proyecto
        Integrador del Módulo 3 del bootcamp Full Stack de Henry.
      </p>

      <h2>Cómo funciona</h2>
      <p>
        El navegador maneja las rutas con History API, sin recargar la página.
        Los mensajes viajan a una función serverless en Vercel, que agrega las
        instrucciones del personaje y consulta a Google Gemini. La clave de la
        API vive solo en el servidor: el navegador nunca la ve.
      </p>

      <h2>El personaje</h2>
      <p>
        Susana de Musicardi es un personaje de <em>Esperando la carroza</em>,
        película argentina de 1985 dirigida por Alejandro Doria, con guion de
        Doria y Jacobo Langsner sobre la obra de teatro homónima de Langsner
        (1962). Es un clásico del grotesco criollo y sus diálogos quedaron en
        el habla cotidiana.
      </p>
      <p>
        Al estrenarse, la crítica le reprochó justamente los gritos de sus
        personajes. Con los años, eso se volvió su marca de identidad.
      </p>
      <p>
        Esta versión conversacional es una interpretación propia con fines
        educativos, sin relación con los autores ni con los titulares de
        derechos de la obra.
      </p>
    </section>
  `,
};
