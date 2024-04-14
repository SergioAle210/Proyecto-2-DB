function generarFactura() {
    const idCuenta = document.getElementById('cuentaId').value;
    const total = document.getElementById('total').value;

    // Aquí debes adaptar el cuerpo de la solicitud según tu modelo de datos
    const facturaData = {
        id_cuenta: idCuenta,
        total: total,
        // Agrega otros campos necesarios para tu factura
    };

    fetch(`http://localhost:3000/api/facturas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(facturaData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Respuesta del servidor no es OK');
        }
        return response.json();
    })
    .then(data => alert('Factura generada: ' + JSON.stringify(data)))
    .catch(error => {
        console.error('Error al generar factura:', error);
        alert('Error al generar factura: ' + error);
    });
}
