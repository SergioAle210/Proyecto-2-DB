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
fetch('http://localhost:3000/test-db')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // or .text() if it's not JSON
  })
  .then(data => {
    console.log(data); // Process your data here
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });


// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).send('Something broke!');
  });

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});



