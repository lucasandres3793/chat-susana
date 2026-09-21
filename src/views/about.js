export const aboutView = {
  render: () => `
    <section class="about">
      <h1>Sobre este proyecto</h1>

      <h2>Que es</h2>
      <p>
        Prueba de concepto de una Single Page Application que permite conversar
        con un personaje de ficcion usando inteligencia artificial. Proyecto
        Integrador del Modulo 3 del bootcamp Full Stack de Henry.
      </p>

      <h2>Como funciona</h2>
      <p>
        El navegador maneja las rutas con History API, sin recargar la pagina.
        Los mensajes viajan a una funcion serverless en Vercel, que agrega las
        instrucciones del personaje y consulta a Google Gemini. La clave de la
        API vive solo en el servidor: el navegador nunca la ve.
      </p>

      <h2>El personaje</h2>
      <p>
        Susana de Musicardi es un personaje de <em>Esperando la carroza</em>,
        pelicula argentina de 1985 dirigida por Alejandro Doria, con guion de
        Doria y Jacobo Langsner sobre la obra de teatro homonima de Langsner
        (1962). Es un clasico del grotesco criollo y sus dialogos quedaron en
        el habla cotidiana.
      </p>
      <p>
        Al estrenarse, la critica le reprocho justamente los gritos de sus
        personajes. Con los años, eso se volvio su marca de identidad.
      </p>
      <p>
        Esta version conversacional es una interpretacion propia con fines
        educativos, sin relacion con los autores ni con los titulares de
        derechos de la obra.
      </p>
    </section>
  `,
};
