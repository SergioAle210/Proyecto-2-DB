// Función para crear un pedido
document.getElementById('crearPedidoForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const idCuenta = document.getElementById('idCuenta').value;
    const detalles = document.getElementById('detalles').value;

    // Aquí debes ajustar el objeto pedidoData según tu modelo de datos
    const pedidoData = {
        idCuenta: idCuenta,
        // Suponiendo que detalles es un array de objetos con idItem y cantidad
        detalles: JSON.parse(detalles)
    };

    fetch('http://localhost:3000/api/pedidos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedidoData),
    })
    .then(response => response.json())
    .then(data => alert('Pedido creado con éxito: ' + JSON.stringify(data)))
    .catch(error => alert('Error al crear pedido: ' + error));
});

// Función para obtener el detalle de un pedido
function obtenerDetallePedido() {
    const idPedido = document.getElementById('idPedido').value;

    fetch(`http://localhost:3000/api/pedidos/${idPedido}`)
    .then(response => response.json())
    .then(data => {
        const detallesDiv = document.getElementById('detallesPedido');
        detallesDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    })
    .catch(error => alert('Error al obtener los detalles del pedido: ' + error));
}
