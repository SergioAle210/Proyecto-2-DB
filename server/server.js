// server/server.js
const express = require('express');
const pool = require('./conn');  // Asegúrate de que la ruta sea correcta

const app = express();
const PORT = process.env.PORT || 3000;

//rutas
const rutaUsuario = require('./src/rutas/Usuarios');
const rutaAreas = require('./src/rutas/Areas');
const rutaMesas = require('./src/rutas/Mesas');
const rutaFactura = require('./src/rutas/Factura');
const rutaPedidos = require('./src/rutas/Pedidos');
const rutaReportes = require('./src/rutas/Reportes');
const rutaFeedback = require('./src/rutas/FeedBack');


app.use(express.json()); // Middleware para parsear JSON
app.use(cors()); //

app.use('/api/usuarios', rutaUsuario);
app.use('/api/mesas', rutaMesas);
app.use('/api/areas', rutaAreas); 
app.use('/api/pedidos', rutaPedidos);
app.use('/api/facturas', rutaFactura);
app.use('/api/reportes', rutaReportes);
app.use('/api/feedback', rutaFeedback);


app.get('/', (req, res) => {
  res.send('API funcionando correctamente.');
});

// Endpoint de prueba para verificar la conexión a la base de datos
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); 
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al conectar con la base de datos');
  }
});


// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).send('Something broke!');
  });
  
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});



