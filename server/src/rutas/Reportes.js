const express = require('express');
const router = express.Router();
const pool = require('../../conn'); 

router.get('/platos-mas-pedidos', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.nombre, COUNT(dp.id_item) AS cantidad_pedidos
       FROM detalle_pedido dp
       JOIN items i ON dp.id_item = i.id_item
       WHERE i.tipo = 'plato'
       GROUP BY i.nombre
       ORDER BY cantidad_pedidos DESC;`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener el reporte de platos más pedidos');
  }
});


module.exports = router;
