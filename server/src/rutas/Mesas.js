const express = require('express');
const router = express.Router();
const pool = require('../../conn'); 

// Funciones controladoras

const mesas = async (req, res) => {
  try {
    // Asegúrate de que la tabla 'cuentas' tenga una columna 'id_mesa' para hacer el JOIN correctamente
    const result = await pool.query(`
      SELECT m.id_mesa, m.capacidad, m.estado, c.id_cuenta, c.estado as cuenta_estado
      FROM mesas m
      LEFT JOIN cuentas c ON m.id_mesa = c.id_mesa AND c.estado = 'abierta'
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).send('Error fetching tables');
  }
};

const abrirCuenta = async (req, res) => {
  const idMesa = req.params.id_mesa;
  try {
    // Verificar si ya existe una cuenta abierta
    const cuentaExistente = await pool.query('SELECT * FROM cuentas WHERE id_mesa = $1 AND estado = \'abierta\'', [idMesa]);
    if (cuentaExistente.rows.length > 0) {
      return res.status(400).json({ message: 'Ya existe una cuenta abierta para esta mesa.', cuenta: cuentaExistente.rows[0]});
    }

    // Abrir nueva cuenta y actualizar el estado de la mesa a 'ocupada'
    await pool.query('BEGIN');
    const nuevaCuenta = await pool.query(
      'INSERT INTO cuentas (id_mesa, estado, fecha_apertura) VALUES ($1, \'abierta\', NOW()) RETURNING *',
      [idMesa]
    );
    await pool.query('UPDATE mesas SET estado = \'ocupada\' WHERE id_mesa = $1', [idMesa]);
    await pool.query('COMMIT');

    res.status(201).json({ message: 'Cuenta abierta y mesa ocupada exitosamente.', cuenta: nuevaCuenta.rows[0] });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al abrir la cuenta de la mesa:', error);
    res.status(500).json({ message: 'Error al abrir la cuenta de la mesa', error });
  }
};




const cerrarCuenta = async (req, res) => {
  const idCuenta = req.params.id_cuenta;
  if (!idCuenta) {
    return res.status(400).send('El ID de la cuenta no se ha proporcionado');
  }
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
router.get('/', mesas);
router.post('/:id_mesa/abrir-cuenta', abrirCuenta);
router.put('/cuentas/:id_cuenta/cerrar', cerrarCuenta);

module.exports = router;
