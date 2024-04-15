document.getElementById('addOrderForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const idCuenta = document.getElementById('idCuenta').value;
    const idItem = document.getElementById('idItem').value;
    const cantidad = document.getElementById('cantidad').value;

    const pedidoData = {
        idCuenta: idCuenta,
        detalles: [{
            idItem: idItem,
            cantidad: cantidad
        }]
    };

    fetch('http://localhost:3000/api/pedidos', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(pedidoData)
    })
    .then(response => response.json())
    .then(data => alert('Pedido añadido exitosamente.'))
    .catch(error => alert('Error al añadir pedido: ' + error.message));
});

function fetchOrderDetails(idPedido) {
    fetch(`http://localhost:3000/api/pedidos/${idPedido}`)
    .then(response => response.json())
    .then(data => {
        const detailsContainer = document.getElementById('orderDetails');
        detailsContainer.innerHTML = `
            <p>ID Pedido: ${data.pedido.id_pedido}</p>
            <p>Fecha y Hora: ${new Date(data.pedido.fecha_hora_pedido).toLocaleString()}</p>
            <div>
                ${data.detalles.map(det => `
                    <p>Ítem: ${det.id_item}, Cantidad: ${det.cantidad}</p>
                `).join('')}
            </div>
        `;
    })
    .catch(error => console.error('Error al cargar detalles del pedido:', error));
}

