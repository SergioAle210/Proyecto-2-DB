// reporte de los platos mas pedidos 
function obtenerReportePlatosMasPedidos() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;

    fetch(`http://localhost:3000/api/reportes/platos-mas-pedidos/${fechaInicio}/${fechaFin}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        const reportePlatosMasPedidosDiv = document.getElementById('reportePlatosMasPedidos');
        reportePlatosMasPedidosDiv.innerHTML = ''; // Limpiar el contenido anterior
        data.forEach(item => {
            reportePlatosMasPedidosDiv.innerHTML += `<p>${item.nombre}: ${item.cantidad_pedidos}</p>`;
        });
    })
    .catch(error => {
        console.error('Error al obtener el reporte de platos más pedidos:', error);
        alert('Error al obtener el reporte de platos más pedidos: ' + error.message);
    });
}

function obtenerReporteHorarioMasPedidos() {
    const fechaInicio = document.getElementById('fechaInicioHorario').value;
    const fechaFin = document.getElementById('fechaFinHorario').value;
    
    fetch(`http://localhost:3000/api/reportes/horario-pedidos-mas-ingresados/${fechaInicio}/${fechaFin}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        const reporteHorarioMasPedidosDiv = document.getElementById('reporteHorarioMasPedidos');
        reporteHorarioMasPedidosDiv.innerHTML = ''; // Limpiar el contenido anterior
        data.forEach(item => {
            reporteHorarioMasPedidosDiv.innerHTML += `<p>${item.hora}: ${item.total_pedidos}</p>`;
        });
    })
    .catch(error => {
        console.error('Error al obtener el reporte de horario con más pedidos:', error);
        alert('Error al obtener el reporte de horario con más pedidos: ' + error.message);
    });
}

function obtenerReportePromedioTiempoComida() {
    const fechaInicio = document.getElementById('fechaInicioTiempoComida').value;
    const fechaFin = document.getElementById('fechaFinTiempoComida').value;
    
    fetch(`http://localhost:3000/api/reportes/promedio-tiempo-comida/${fechaInicio}/${fechaFin}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        const reportePromedioTiempoComidaDiv = document.getElementById('reportePromedioTiempoComida');
        reportePromedioTiempoComidaDiv.innerHTML = ''; // Limpiar el contenido anterior
        data.forEach(item => {
            reportePromedioTiempoComidaDiv.innerHTML += `<p>${item.capacidad}: ${item.tiempo_promedio}</p>`;
        });
    })
    .catch(error => {
        console.error('Error al obtener el reporte de promedio de tiempo de comida:', error);
        alert('Error al obtener el reporte de promedio de tiempo de comida: ' + error.message);
    });
}

function obtenerReporteQuejasPorEmpleado() {
    const fechaInicio = document.getElementById('fechaInicioQuejasEmpleado').value;
    const fechaFin = document.getElementById('fechaFinQuejasEmpleado').value;
    
    fetch(`http://localhost:3000/api/reportes/quejas-por-empleado/${fechaInicio}/${fechaFin}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        const reporteQuejasPorEmpleadoDiv = document.getElementById('reporteQuejasPorEmpleado');
        reporteQuejasPorEmpleadoDiv.innerHTML = ''; // Limpiar el contenido anterior
        data.forEach(item => {
            reporteQuejasPorEmpleadoDiv.innerHTML += `<p>La queja del empleado ${item.nombre_empleado} es ${item.motivo} el cual tiene el rol de ${item.rol}</p>`;
        });
    })
}

function obtenerReporteQuejasPorPlato() {
    const fechaInicio = document.getElementById('fechaInicioQuejasPlato').value;
    const fechaFin = document.getElementById('fechaFinQuejasPlato').value;
    
    fetch(`http://localhost:3000/api/reportes/quejas-por-plato/${fechaInicio}/${fechaFin}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        const reporteQuejasPorPlatoDiv = document.getElementById('reporteQuejasPorPlato');
        reporteQuejasPorPlatoDiv.innerHTML = ''; // Limpiar el contenido anterior
        data.forEach(item => {
            reporteQuejasPorPlatoDiv.innerHTML += `<p>La queja del plato ${item.nombre_plato} es ${item.motivo}</p>`;
        });
    })
}

function obtenerReporteEficienciaMeseros() {

    fetch(`http://localhost:3000/api/reportes/eficiencia-meseros`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        const reporteEficienciaMeserosDiv = document.getElementById('reporteEficienciaMeseros');
        reporteEficienciaMeserosDiv.innerHTML = ''; // Limpiar el contenido anterior
        data.forEach(item => {
            reporteEficienciaMeserosDiv.innerHTML += `<p>En el mes y año ${item.mes} El mesero ${item.nombre_mesero} tiene una eficiencia promedio de ${item.promedio_clasificacion}</p>`;
        });
    })
    .catch(error => {
        console.error('Error al obtener el reporte de eficiencia de meseros:', error);
        alert('Error al obtener el reporte de eficiencia de meseros: ' + error.message);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            const functionName = 'obtenerReporte' + button.parentElement.querySelector('h2').textContent.replace(/\s+/g, '');
            if (typeof window[functionName] === 'function') {
                window[functionName]();
            }
        });
    });
});
