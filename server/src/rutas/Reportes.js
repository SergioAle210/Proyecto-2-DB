const express = require('express');
const router = express.Router();
const pool = require('../../conn'); 

// 1 Reporte: Platos más pedidos
router.get('/platos-mas-pedidos/:fechaInicio/:fechaFin', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    // Consulta SQL para obtener los platos más pedidos en el rango de fechas proporcionado
    const result = await pool.query(
        `SELECT i.nombre, COUNT(dp.id_item) AS cantidad_pedidos
        FROM detalle_pedido dp
        JOIN pedidos p ON dp.id_pedido = p.id_pedido
        JOIN items i ON dp.id_item = i.id_item
        WHERE i.tipo = 'plato'
        AND p.fecha_hora_pedido BETWEEN $1 AND $2
        GROUP BY i.nombre
        ORDER BY cantidad_pedidos DESC;`,
        [fecha_inicio, fecha_fin]
    );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener el reporte de platos más pedidos');
    }
});

// 2 Reporte: Horario con más pedidos
router.get('/horario-pedidos-mas-ingresados/:fechaInicio/:fechaFin', async (req, res) => {
  try {
    // Obtener los parámetros de consulta del rango de fechas
    const { fecha_inicio, fecha_fin } = req.query;

    // Consulta SQL para obtener el horario con más pedidos en el rango de fechas proporcionado
    const result = await pool.query(
      `SELECT DATE_PART('hour', p.fecha_hora_pedido) AS hora, COUNT(*) AS total_pedidos
       FROM pedidos p
       WHERE p.fecha_hora_pedido BETWEEN $1 AND $2
       GROUP BY DATE_PART('hour', p.fecha_hora_pedido)
       ORDER BY total_pedidos DESC
       LIMIT 1;`,
      [fecha_inicio, fecha_fin]
    );

    // Enviar el resultado como respuesta
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener el horario con más pedidos');
  }
});

// 3 Reporte: Promedio de tiempo de comida
router.get('/promedio-tiempo-comida/:fechaInicio/:fechaFin', async (req, res) => {
  try {
    // Obtener los parámetros de consulta del rango de fechas
    const { fecha_inicio, fecha_fin } = req.query;

    // Consulta SQL para obtener el promedio de tiempo de comida por capacidad de la mesa
    const result = await pool.query(
      `SELECT m.capacidad, 
              AVG(EXTRACT(EPOCH FROM (c.fecha_cierre - c.fecha_apertura))) AS tiempo_promedio
       FROM cuentas c
       JOIN mesas m ON c.id_mesa = m.id_mesa
       WHERE c.estado = 'cerrada' 
         AND c.fecha_apertura BETWEEN $1 AND $2
       GROUP BY m.capacidad
       ORDER BY m.capacidad ASC;`,
      [fecha_inicio, fecha_fin]
    );

    // Enviar el resultado como respuesta
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener el promedio de tiempo de comida');
  }
});

// 4 Reporte: Quejas por empleado
router.get('/reporte-quejas-empleados/:fechaInicio/:fechaFin', async (req, res) => {
  try {
    // Obtener los parámetros de consulta del rango de fechas
    const { fecha_inicio, fecha_fin } = req.query;

    // Consulta SQL para obtener el reporte de quejas por empleado
    const result = await pool.query(
      `SELECT e.nombre AS nombre_empleado,
              q.motivo,
              e.rol
       FROM quejas q
       JOIN usuarios e ON q.id_empleado = e.id_usuario
       WHERE q.fecha_hora BETWEEN $1 AND $2
       ORDER BY nombre_empleado;`,
      [fecha_inicio, fecha_fin]
    );

    // Enviar el resultado como respuesta
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener el reporte de quejas por empleado');
  }
});

// 5 Reporte: Quejas por plato
router.get('/reporte-quejas-items/:fechaInicio/:fechaFin', async (req, res) => {
  try {
    // Obtener las fechas de inicio y fin del rango desde la solicitud
    const { fechaInicio, fechaFin } = req.query;

    // Consulta SQL para obtener el reporte de quejas agrupadas por plato
    const result = await pool.query(
      `SELECT i.nombre AS nombre_plato,
              q.motivo
       FROM Quejas q
       JOIN Items i ON q.ID_Item = i.ID_Item
       WHERE q.Fecha_Hora BETWEEN $1 AND $2
       GROUP BY i.nombre, q.motivo
       ORDER BY nombre_plato;`,
      [fechaInicio, fechaFin]
    );
    
    // Enviar el resultado como respuesta
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener el reporte de quejas');
  }
});

// 6 Reporte: Eficiencia de meseros
router.get('/eficiencia-meseros', async (req, res) => {
  try {
    // Consulta SQL para obtener la eficiencia de los meseros en los últimos 6 meses
    const result = await pool.query(
      `SELECT 
          to_char(q.fecha_hora, 'YYYY-MM') AS mes,
          u.nombre AS nombre_mesero,
          AVG(q.clasificacion) AS promedio_clasificacion
      FROM 
          Quejas q
      JOIN 
          Usuarios u ON q.ID_Empleado = u.ID_Usuario
      WHERE 
          u.rol = 'Mesero'
          AND q.fecha_hora BETWEEN DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '6 month' AND CURRENT_DATE
      GROUP BY 
          mes, nombre_mesero
      ORDER BY 
          mes, nombre_mesero;`
    );

    // Enviar el resultado como respuesta
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener la eficiencia de los meseros');
  }
});

module.exports = router;
