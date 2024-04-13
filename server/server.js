// server/server.js
const express = require('express');
const pool = require('./conn');  // Asegúrate de que la ruta sea correcta

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware para parsear JSON

app.get('/', (req, res) => {
  res.send('API funcionando correctamente.');
});

// Endpoint de prueba para verificar la conexión a la base de datos
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); // Query de prueba
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al conectar con la base de datos');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
