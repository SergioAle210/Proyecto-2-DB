const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../../conn');  // Asegúrate que la ruta al archivo de conexión sea correcta
const router = express.Router();

// Funciones controladoras
const crearUsuario = async (req, res) => {
    const { nombre, correoElectronico, contrasena, rol } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const newUser = await pool.query(
            'INSERT INTO usuarios (nombre, correo_electronico, contrasena, rol) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, correoElectronico, hashedPassword, rol]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar el usuario');
    }
};

const iniciarSesion = async (req, res) => {
    const { correoElectronico, contrasena } = req.body;
    try {
        const user = await pool.query('SELECT * FROM usuarios WHERE correo_electronico = $1', [correoElectronico]);
        if (user.rows.length > 0) {
            const isValid = await bcrypt.compare(contrasena, user.rows[0].contrasena);
            if (isValid) {
                res.status(200).send('Inicio de sesión exitoso');
            } else {
                res.status(401).send('Contraseña incorrecta');
            }
        } else {
            res.status(404).send('Usuario no encontrado');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al iniciar sesión');
    }
};

const obtenerUsuarios = async (req, res) => {
    try {
        const allUsers = await pool.query('SELECT * FROM usuarios');
        res.status(200).json(allUsers.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener usuarios');
    }
};

const obtenerUsuarioPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        if (user.rows.length > 0) {
            res.json(user.rows[0]);
        } else {
            res.status(404).send('Usuario no encontrado');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener usuario');
    }
};

const actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, correoElectronico, contrasena, rol } = req.body;
    try {
        const updatedUser = await pool.query(
            'UPDATE usuarios SET nombre = $1, correo_electronico = $2, contrasena = $3, rol = $4 WHERE id = $5 RETURNING *',
            [nombre, correoElectronico, contrasena, rol, id]
        );
        res.json(updatedUser.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar usuario');
    }
};

const eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
        res.status(204).send('Usuario eliminado');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar usuario');
    }
};

// Rutas
router.post('/signup', crearUsuario);
router.post('/login', iniciarSesion);
router.get('/', obtenerUsuarios);
router.get('/:id', obtenerUsuarioPorId);
router.put('/:id', actualizarUsuario);
router.put('/:id', eliminarUsuario);

module.exports = router;