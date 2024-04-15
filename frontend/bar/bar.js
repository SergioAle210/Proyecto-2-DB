function obtenerListadoBebidas() {
    fetch(`http://localhost:3000/api/bar/bebidas-a-preparar`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const bebidasListDiv = document.getElementById('bebidasList');
            bebidasListDiv.innerHTML = ''; // Limpiar el contenido anterior
            data.forEach(bebida => {
                bebidasListDiv.innerHTML += `<p>Fecha: ${bebida.fecha_pedido} - Hora: ${bebida.hora_pedido}:${bebida.minutos_pedido} - Bebida: ${bebida.nombre_bebida} - Cantidad: ${bebida.cantidad_por_hacer}</p>`;
            });
        })
        .catch(error => {
            console.error('Error al obtener el listado de bebidas:', error);
            alert('Error al obtener el listado de bebidas: ' + error.message);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    obtenerListadoBebidas();
});