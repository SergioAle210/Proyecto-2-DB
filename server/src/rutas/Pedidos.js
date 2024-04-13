const express = require('express');
const router = express.Router();
const pool = require('../../conn'); 

// Controladores
const tomarNuevoPedido = async (req, res) => {
  const { idCuenta, detalles } = req.body;
  try {
    const resultadoPedido = await pool.query(
      'INSERT INTO pedidos (id_cuenta, fecha_hora_pedido) VALUES ($1, NOW()) RETURNING *',
      [idCuenta]
    );

    const idPedido = resultadoPedido.rows[0].id_pedido;
    const detallesResultados = await Promise.all(detalles.map(async (detalle) => {
      const result = await pool.query(
        'INSERT INTO detalle_pedido (id_pedido, id_item, cantidad) VALUES ($1, $2, $3) RETURNING *',
        [idPedido, detalle.idItem, detalle.cantidad]
      );
      return result.rows[0];
    }));

    res.status(201).json({
      pedido: resultadoPedido.rows[0],
      detalles: detallesResultados
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al tomar el pedido');
  }
};

const obtenerDetallesPedido = async (req, res) => {
  const { id_pedido } = req.params;
  try {
    const resultadoPedido = await pool.query('SELECT * FROM pedidos WHERE id_pedido = $1', [id_pedido]);
    const resultadoDetalles = await pool.query('SELECT * FROM detalle_pedido WHERE id_pedido = $1', [id_pedido]);

    res.json({
      pedido: resultadoPedido.rows[0],
      detalles: resultadoDetalles.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los detalles del pedido');
  }
};

const listarPedidosCocina = async (req, res) => {
  try {
    const pedidosCocina = await pool.query(
      "SELECT p.id_pedido, p.fecha_hora_pedido, dp.id_item, i.nombre, dp.cantidad FROM pedidos p JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido JOIN items i ON dp.id_item = i.id_item WHERE i.tipo = 'plato' AND p.estado = 'pendiente' ORDER BY p.fecha_hora_pedido ASC;"
    );
    res.json(pedidosCocina.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor al obtener los pedidos para la cocina');
  }
};

const listarPedidosBar = async (req, res) => {
  try {
    const pedidosBar = await pool.query(
      "SELECT p.id_pedido, p.fecha_hora_pedido, dp.id_item, i.nombre, dp.cantidad FROM pedidos p JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido JOIN items i ON dp.id_item = i.id_item WHERE i.tipo = 'bebida' AND p.estado = 'pendiente' ORDER BY p.fecha_hora_pedido ASC;"
    );
    res.json(pedidosBar.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor al obtener los pedidos para el bar');
  }
};

// Rutas
router.post('/', tomarNuevoPedido);
router.get('/:id_pedido', obtenerDetallesPedido);
router.get('/cocina', listarPedidosCocina);
router.get('/bar', listarPedidosBar);

module.exports = router;
