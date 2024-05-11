const express = require('express');
const app = express();
const port = 3000;

// Ruta que sirve un archivo HTML estático
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Este es el back</h1>
      </body>
    </html>
  `);
});

// Ruta que devuelve un JSON
app.get('/api', (req, res) => {
  res.json({ mensaje: '¡Hola, mundo!' });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
