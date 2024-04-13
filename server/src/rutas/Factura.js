const express = require('express');
const router = express.Router();
const pool = require('../../conn');  

// Controladores
const obtenerPedido = async (req, res) => {
  try {
    const { id_cuenta } = req.params;
    const pedido = await pool.query(
      `SELECT p.id_pedido, p.fecha_hora_pedido, dp.id_item, i.nombre, dp.cantidad, i.precio, (dp.cantidad * i.precio) as subtotal
       FROM cuentas c
       JOIN pedidos p ON c.id_cuenta = p.id_cuenta
       JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
       JOIN items i ON dp.id_item = i.id_item
       WHERE c.id_cuenta = $1;`,
      [id_cuenta]
    );
    res.json(pedido.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los detalles del pedido');
  }
};

const obtenerFactura = async (req, res) => {
  try {
    const { id_factura } = req.params;
    const factura = await pool.query(
      `SELECT f.*, dp.id_pedido, i.nombre, dp.cantidad, i.precio, (dp.cantidad * i.precio) as subtotal
       FROM facturas f
       JOIN pedidos p ON f.id_cuenta = p.id_cuenta
       JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
       JOIN items i ON dp.id_item = i.id_item
       WHERE f.id_factura = $1;`,
      [id_factura]
    );
    res.json(factura.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener la factura');
  }
};

const cerrarCuentaYGenerarFactura = async (req, res) => {
  const { id_cuenta, total, nit_cliente, nombre_cliente, direccion_cliente } = req.body;
  try {
    await pool.query('BEGIN');
    await pool.query('UPDATE cuentas SET estado = \'cerrada\', fecha_cierre = NOW() WHERE id_cuenta = $1', [id_cuenta]);
    const nuevaFactura = await pool.query(
      'INSERT INTO facturas (id_cuenta, total, fecha_hora, nit_cliente, nombre_cliente, direccion_cliente) VALUES ($1, $2, NOW(), $3, $4, $5) RETURNING id_factura;',
      [id_cuenta, total, nit_cliente, nombre_cliente, direccion_cliente]
    );
    await pool.query('COMMIT');
    res.status(201).json(nuevaFactura.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    res.status(500).send('Error al cerrar la cuenta y generar la factura');
  }
};

const registrarPagoDeFactura = async (req, res) => {
  const { id_factura, monto, tipo_pago } = req.body;
  try {
    await pool.query(
      'INSERT INTO pagos (id_factura, monto, tipo_pago) VALUES ($1, $2, $3);',
      [id_factura, monto, tipo_pago]
    );
    res.status(201).send('Pago registrado correctamente');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al registrar el pago');
  }
};

// Rutas
router.get('/cuentas/:id_cuenta/pedido', obtenerPedido);
router.get('/facturas/:id_factura', obtenerFactura);
router.post('/facturas', cerrarCuentaYGenerarFactura);
router.post('/pagos', registrarPagoDeFactura);

module.exports = router;
