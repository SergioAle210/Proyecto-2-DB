const express = require('express');
const router = express.Router();
const pool = require('../../conn'); 

router.get('/bebidas-a-preparar', async (req, res) => {   
    try {
        const result = await pool.query(
            `SELECT 
                i.Nombre AS nombre_bebida,
                dp.cantidad as cantidad_por_hacer,
                TO_CHAR(p.Fecha_Hora_Pedido, 'YYYY-MM-DD') AS fecha_pedido,
                EXTRACT(HOUR FROM p.Fecha_Hora_Pedido) AS hora_pedido,
                EXTRACT(MINUTE FROM p.Fecha_Hora_Pedido) AS minutos_pedido
            FROM 
                Pedidos p
            JOIN 
                Detalle_Pedido dp ON p.ID_Pedido = dp.ID_Pedido
            JOIN 
                Items i ON dp.ID_Item = i.ID_Item
            WHERE 
                i.Tipo = 'bebida'
                AND p.Estado = 'pending' -- Solo seleccionar pedidos no completados
            ORDER BY 
                p.Fecha_Hora_Pedido;`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener el listado de bebidas a preparar');
    }
});

module.exports = router;