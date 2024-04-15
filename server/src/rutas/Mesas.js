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

async function abrirCuenta(req, res) {
  const { id_mesa } = req.params;
  try {
      const meseros = await getMeseros();
      if (meseros.length === 0) {
          return res.status(400).json({ error: 'No hay meseros disponibles' });
      }
      const mesero = meseros[0]; // Asume que al menos un mesero está disponible

      const resultado = await pool.query(
          'INSERT INTO cuentas (id_mesa, id_empleado, estado, fecha_apertura) VALUES ($1, $2, \'abierta\', NOW()) RETURNING *',
          [id_mesa, mesero.id_usuario]
      );
      res.json(resultado.rows[0]);
  } catch (error) {
      console.error('Error al abrir la cuenta de la mesa:', error);
      res.status(500).send('Error al abrir la cuenta');
  }
}









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

async function getMeseros() {
  try {
      const result = await pool.query('SELECT * FROM usuarios WHERE rol = $1', ['Mesero']);
      if (result.rows.length > 0) {
          return result.rows; // Devuelve una lista de meseros
      } else {
          throw new Error('No hay meseros disponibles');
      }
  } catch (error) {
      console.error('Error fetching waiters:', error);
      throw error; // Propaga el error para manejarlo en la función superior
  }
}


// Rutas
router.get('/', mesas);
router.get('/Usuarios', getMeseros);
router.post('/:id_mesa/abrir-cuenta', abrirCuenta);
router.put('/cuentas/:id_cuenta/cerrar', cerrarCuenta);

module.exports = router;
