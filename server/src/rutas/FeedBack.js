const express = require('express');
const router = express.Router();
const pool = require('../../conn'); 

// Controladores
const registrarEncuesta = async (req, res) => {
  const { id_cuenta, amabilidad_mesero, exactitud_pedido } = req.body;
  try {
    const nuevaEncuesta = await pool.query(
      'INSERT INTO encuestas (id_cuenta, amabilidad_mesero, exactitud_pedido) VALUES ($1, $2, $3) RETURNING *',
      [id_cuenta, amabilidad_mesero, exactitud_pedido]
    );
    res.status(201).json(nuevaEncuesta.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al registrar la encuesta');
  }
};

const registrarQueja = async (req, res) => {
  const { id_cliente, motivo, clasificacion, id_empleado, id_item } = req.body;
  try {
    const nuevaQueja = await pool.query(
      'INSERT INTO quejas (id_cliente, fecha_hora, motivo, clasificacion, id_empleado, id_item) VALUES ($1, NOW(), $2, $3, $4, $5) RETURNING *',
      [id_cliente, motivo, clasificacion, id_empleado, id_item]
    );
    res.status(201).json(nuevaQueja.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al registrar la queja');
  }
};

// Rutas
router.post('/encuestas', registrarEncuesta);
router.post('/quejas', registrarQueja);

module.exports = router;
