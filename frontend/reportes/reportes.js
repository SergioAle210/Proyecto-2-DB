function obtenerReporteVentas() {
// reportes.js

// Función para solicitar un reporte de ventas desde el servidor
function obtenerReporteVentas() {
    fetch('http://localhost:3000/api/reportes/ventas', {
        method: 'GET', // o 'POST' si así se requiere en tu API
        headers: {
            'Content-Type': 'application/json',
            // Incluye aquí otros encabezados si son necesarios, como tokens de autenticación
        },
        // Si necesitas enviar un cuerpo de solicitud, como fechas de filtro, inclúyelo aquí
    })
    .then(response => {
        // Verificamos primero si la respuesta del servidor es exitosa
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Luego verificamos que la respuesta sea de tipo JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('No se recibió una respuesta JSON válida');
        }
        return response.json();
    })
    .then(data => {
        // Aquí procesas y muestras los datos del reporte
        console.log(data);
        const reporteVentasDiv = document.getElementById('reporteVentas');
        reporteVentasDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    })
    .catch(error => {
        // Aquí manejas cualquier error que ocurra durante la solicitud o el procesamiento de la respuesta
        console.error('Error al obtener el reporte de ventas:', error);
        alert('Error al obtener el reporte de ventas: ' + error.message);
    });
}

// Llamamos a la función cuando se hace clic en el botón de 'Generar Reporte'
document.addEventListener('DOMContentLoaded', () => {
    const botonReporteVentas = document.querySelector('#reporteVentas button');
    botonReporteVentas.addEventListener('click', obtenerReporteVentas);
});
}
