// server/server.js
const express = require('express');
const pool = require('./conn');  // Asegúrate de que la ruta sea correcta

const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

//rutas
const rutaUsuario = require('./src/rutas/Usuarios');
const rutaAreas = require('./src/rutas/Areas');
const rutaMesas = require('./src/rutas/Mesas');
const rutaFactura = require('./src/rutas/Factura');
const rutaPedidos = require('./src/rutas/Pedidos');
const rutaReportes = require('./src/rutas/Reportes');
<<<<<<< Updated upstream
const rutaFeedback = require('./src/rutas/Feedback');
const rutaBar = require('./src/rutas/Bar');
=======

const rutaItems = require('./src/rutas/items');

>>>>>>> Stashed changes

app.use(express.json()); // Middleware para parsear JSON
app.use(cors()); //

app.use('/api/usuarios', rutaUsuario);
app.use('/api/mesas', rutaMesas);
app.use('/api/areas', rutaAreas); 
app.use('/api/pedidos', rutaPedidos);
app.use('/api/facturas', rutaFactura);
app.use('/api/reportes', rutaReportes);
app.use('/api/feedback', rutaFeedback);
<<<<<<< Updated upstream
app.use('/api/bar', rutaBar);

=======
app.use('/api/items', rutaItems);
>>>>>>> Stashed changes

app.get('/test-db', (req, res) => {
    // Replace this with your actual database testing logic
    // For example, you could try to perform a simple SELECT query
    pool.query('SELECT NOW()', (err, result) => {
      if (err) {
        console.error('Error testing database:', err);
        res.status(500).send('Database connection failed');
      } else {
        console.log('Database connection test succeeded:', result.rows);
        res.status(200).send('Database connection test succeeded');
      }
    });
  });
  


// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).send('Something broke!');
  });

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});



