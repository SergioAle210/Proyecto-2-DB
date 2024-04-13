const express = require('express');
const router = express.Router();
const pool = require('../../conn'); 

// Funciones controladoras
const abrirCuenta = async (req, res) => {
  const idMesa = req.params.id_mesa;
  try {
    const cuenta = await pool.query('SELECT * FROM cuentas WHERE id_mesa = $1 AND estado = \'abierta\'', [idMesa]);

    if (cuenta.rows.length > 0) {
      return res.status(400).send('Ya existe una cuenta abierta para esta mesa.');
    }

    const nuevaCuenta = await pool.query(
      'INSERT INTO cuentas (id_mesa, estado, fecha_apertura) VALUES ($1, \'abierta\', NOW()) RETURNING *',
      [idMesa]
    );
    res.status(201).json(nuevaCuenta.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al abrir la cuenta de la mesa');
  }
};

const cerrarCuenta = async (req, res) => {
  const idCuenta = req.params.id_cuenta;
  try {
    const cuentaActualizada = await pool.query(
      'UPDATE cuentas SET estado = \'cerrada\', fecha_cierre = NOW() WHERE id_cuenta = $1 RETURNING *',
      [idCuenta]
    );

    if (cuentaActualizada.rows.length > 0) {
      res.json(cuentaActualizada.rows[0]);
    } else {
      res.status(404).send('Cuenta no encontrada o ya está cerrada.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cerrar la cuenta de la mesa');
  }
};

// Rutas
router.post('/:id_mesa/abrir-cuenta', abrirCuenta);
router.put('/cuentas/:id_cuenta/cerrar', cerrarCuenta);

module.exports = router;
