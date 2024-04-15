const express = require('express');
const router = express.Router();
const pool = require('../../conn'); // Ensure this points to your actual database connection file.

// GET items for the dropdown menu
router.get('/', async (req, res) => {
    try {
        const items = await pool.query('SELECT id_item, nombre, precio, descripcion FROM items');
        res.json(items.rows);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items');
    }
});

module.exports = router;
