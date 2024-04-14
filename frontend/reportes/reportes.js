function obtenerReporteVentas() {

function obtenerReporteVentas() {
    fetch('http://localhost:3000/api/reportes/ventas', {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json',
            
        },
        
    })
    .then(response => {
  
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
 
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('No se recibió una respuesta JSON válida');
        }
        return response.json();
    })
    .then(data => {
     
        console.log(data);
        const reporteVentasDiv = document.getElementById('reporteVentas');
        reporteVentasDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    })
    .catch(error => {
        
        console.error('Error al obtener el reporte de ventas:', error);
        alert('Error al obtener el reporte de ventas: ' + error.message);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const botonReporteVentas = document.querySelector('#reporteVentas button');
    botonReporteVentas.addEventListener('click', obtenerReporteVentas);
});
}
