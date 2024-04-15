const express = require('express');
const router = express.Router();
const pool = require('../../conn'); 

// Controladores
const tomarNuevoPedido = async (req, res) => {
  let { idCuenta, detalles } = req.body;
  idCuenta = parseInt(idCuenta);  // Convertir idCuenta a entero

  if (!Number.isInteger(idCuenta)) {
    return res.status(400).json({ error: "Invalid idCuenta, must be an integer." });
  }

  try {
    const resultadoPedido = await pool.query(
      'INSERT INTO pedidos (id_cuenta, fecha_hora_pedido, estado) VALUES ($1, NOW(), $2) RETURNING *',
      [idCuenta, 'pending']  // Asumimos que el estado inicial es 'pending'
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
    console.error('Error al tomar el pedido:', error);
    res.status(500).send('Error al tomar el pedido');
  }
};


const obtenerDetallesPedido = async (req, res) => {
  const { id_pedido } = req.params;
  try {
    // Primero obtiene los detalles del pedido basado en id_pedido
    const resultadoPedido = await pool.query(
      'SELECT * FROM pedidos WHERE id_pedido = $1',
      [id_pedido]
    );

    // Comprueba si el pedido existe antes de intentar obtener más detalles
    if (resultadoPedido.rows.length === 0) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    // Si el pedido existe, obtiene los detalles asociados a ese pedido
    const resultadoDetalles = await pool.query(
      'SELECT * FROM detalle_pedido WHERE id_pedido = $1',
      [id_pedido]
    );

    console.log('Detalles del pedido:', {
      pedido: resultadoPedido.rows[0],
      detalles: resultadoDetalles.rows
    });

    // Enviar respuesta con los datos del pedido y sus detalles
    res.json({
      pedido: resultadoPedido.rows[0],
      detalles: resultadoDetalles.rows
    });
  } catch (error) {
    console.error('Error al obtener los detalles del pedido:', error);
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
