const express = require('express');
const router = express.Router();
const pool = require('../../conn');

// Funciones controladoras
const obtenerTodasLasAreas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Areas;');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener las áreas');
  }
};

const obtenerAreaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Areas WHERE ID_Area = $1;', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Área no encontrada');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener el área');
  }
};

const crearArea = async (req, res) => {
  const { nombre_area, es_fumador, puede_mover_mesas } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Areas (Nombre_Area, Es_Fumador, Puede_Mover_Mesas) VALUES ($1, $2, $3) RETURNING *;',
      [nombre_area, es_fumador, puede_mover_mesas]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al crear la área');
  }
};

const actualizarArea = async (req, res) => {
  const { id } = req.params;
  const { nombre_area, es_fumador, puede_mover_mesas } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Areas SET Nombre_Area = $2, Es_Fumador = $3, Puede_Mover_Mesas = $4 WHERE ID_Area = $1 RETURNING *;',
      [id, nombre_area, es_fumador, puede_mover_mesas]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar la área');
  }
};

const eliminarArea = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Areas WHERE ID_Area = $1;', [id]);
    res.status(204).send('Área eliminada');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar la área');
  }
};

// Definición de rutas
router.get('/', obtenerTodasLasAreas);
router.get('/:id', obtenerAreaPorId);
router.post('/', crearArea);
router.put('/:id', actualizarArea);
router.delete('/:id', eliminarArea);

module.exports = router;
