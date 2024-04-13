// server/src/routes/usuariosRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../../conn');
const router = express.Router();

router.post('/signin', async (req, res) => {
  try {
    const { nombre, correoElectronico, contrasena, rol } = req.body;
    const hashedPassword = await bcrypt.hash(contrasena, 10); // El '10' es el número de rondas de salting

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo_electronico, contrasena, rol) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, correoElectronico, hashedPassword, rol]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al registrar el usuario');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { correoElectronico, contrasena } = req.body;
    const result = await pool.query('SELECT * FROM usuarios WHERE correo_electronico = $1', [correoElectronico]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(contrasena, user.contrasena);
      if (isMatch) {
        res.status(200).send('Inicio de sesión exitoso');
      } else {
        res.status(400).send('Correo electrónico o contraseña incorrecta');
      }
    } else {
      res.status(404).send('Usuario no encontrado');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;
