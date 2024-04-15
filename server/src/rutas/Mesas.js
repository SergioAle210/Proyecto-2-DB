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
    await pool.query('BEGIN'); // Iniciar transacción

    const cuentaExistente = await pool.query('SELECT * FROM cuentas WHERE id_mesa = $1 AND estado = \'abierta\'', [idMesa]);
    if (cuentaExistente.rows.length > 0) {
      await pool.query('ROLLBACK'); // Revertir transacción si ya existe una cuenta abierta
      return res.status(400).json({ message: 'Ya existe una cuenta abierta para esta mesa.' });
    }

    const nuevaCuenta = await pool.query(
      'INSERT INTO cuentas (id_mesa, id_empleado, estado, fecha_apertura) VALUES ($1, 2, \'abierta\', NOW()) RETURNING *',
      [idMesa]
    );

    await pool.query(
      'UPDATE mesas SET estado = \'ocupada\' WHERE id_mesa = $1',
      [idMesa]
    );

    await pool.query('COMMIT'); // Confirmar transacción
    res.status(201).json({ message: 'Cuenta abierta y mesa ocupada exitosamente.', cuenta: nuevaCuenta.rows[0] });
  } catch (error) {
    await pool.query('ROLLBACK'); // Revertir transacción en caso de error
    console.error('Error al abrir la cuenta de la mesa:', error);
    res.status(500).json({ message: 'Error al abrir la cuenta de la mesa', error });
  }
};




const cerrarCuenta = async (req, res) => {
  const idCuenta = req.params.id_cuenta;
  try {
    await pool.query('BEGIN'); // Iniciar transacción

    const cuentaActualizada = await pool.query(
      'UPDATE cuentas SET estado = \'cerrada\', fecha_cierre = NOW() WHERE id_cuenta = $1 RETURNING *',
      [idCuenta]
    );

    if (cuentaActualizada.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).send('Cuenta no encontrada o ya está cerrada.');
    }

    await pool.query(
      'UPDATE mesas SET estado = \'disponible\' WHERE id_mesa = (SELECT id_mesa FROM cuentas WHERE id_cuenta = $1)',
      [idCuenta]
    );

    await pool.query('COMMIT');
    res.json(cuentaActualizada.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al cerrar la cuenta de la mesa:', error);
    res.status(500).send('Error al cerrar la cuenta de la mesa');
  }
};

const getMeseros = async (req, res) => {
  try {
      const result = await pool.query("SELECT ID_Usuario, Nombre FROM Usuarios WHERE Rol = 'Mesero';");
      res.json(result.rows);
  } catch (err) {
      console.error('Error fetching waiters:', err);
      res.status(500).send('Error fetching waiters');
  }
};

// Rutas
router.get('/', mesas);
router.get('/Usuarios', getMeseros);
router.post('/:id_mesa/abrir-cuenta', abrirCuenta);
router.put('/cuentas/:id_cuenta/cerrar', cerrarCuenta);

module.exports = router;
