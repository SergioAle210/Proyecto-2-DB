function obtenerListadoPlatos() {
    fetch(`http://localhost:3000/api/cocina/platos-a-preparar`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const platosListDiv = document.getElementById('platosList');
        platosListDiv.innerHTML = ''; // Limpiar el contenido anterior
        data.forEach(plato => {
            platosListDiv.innerHTML += `<p>Fecha: ${plato.fecha_pedido} - Hora: ${plato.hora_pedido}:${plato.minutos_pedido} - Bebida: ${plato.nombre_plato} - Cantidad: ${plato.cantidad_por_hacer}</p>`;
        });
    })
    .catch(error => {
        console.error('Error al obtener el listado de platos:', error);
        alert('Error al obtener el listado de platos: ' + error.message);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    obtenerListadoPlatos();
});