// reporte de los platos mas pedidos 
function obtenerReportePlatosMasPedidos() {
    const fechaInicio = formatearFecha(document.getElementById('fechaInicioPlatos').value);
    const fechaFin = formatearFecha(document.getElementById('fechaFinPlatos').value);

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
    const fechaInicio = formatearFecha(document.getElementById('fechaInicioHorario').value);
    const fechaFin = formatearFecha(document.getElementById('fechaFinHorario').value);
    
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
            reporteHorarioMasPedidosDiv.innerHTML += `<p>El horario ${item.hora} tiene una cantidad de ${item.total_pedidos} items pedidos</p>`;
        });
    })
    .catch(error => {
        console.error('Error al obtener el reporte de horario con más pedidos:', error);
        alert('Error al obtener el reporte de horario con más pedidos: ' + error.message);
    });
}

function obtenerReportePromedioTiempoComida() {
    const fechaInicio = formatearFecha(document.getElementById('fechaInicioTiempoComida').value);
    const fechaFin = formatearFecha(document.getElementById('fechaFinTiempoComida').value);
    
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
            const horas = Math.floor(item.horas); // Redondear las horas hacia abajo
            const minutos = Math.round(item.minutos); // Redondear los minutos al entero más cercano
            reportePromedioTiempoComidaDiv.innerHTML += `<p>${item.capacidad} personas ha estado un promedio de ${horas} horas con ${minutos} minutos</p>`;
        });
    })
    .catch(error => {
        console.error('Error al obtener el reporte de promedio de tiempo de comida:', error);
        alert('Error al obtener el reporte de promedio de tiempo de comida: ' + error.message);
    });
}

function obtenerReporteQuejasPorEmpleado() {
    const fechaInicio = formatearFecha(document.getElementById('fechaInicioQuejasEmpleado').value);
    const fechaFin = formatearFecha(document.getElementById('fechaFinQuejasEmpleado').value);
    
    fetch(`http://localhost:3000/api/reportes/reporte-quejas-empleados/${fechaInicio}/${fechaFin}`)
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
    const fechaInicio = formatearFecha(document.getElementById('fechaInicioQuejasPlato').value);
    const fechaFin = formatearFecha(document.getElementById('fechaFinQuejasPlato').value);
    
    fetch(`http://localhost:3000/api/reportes/reporte-quejas-items/${fechaInicio}/${fechaFin}`)
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
            reporteEficienciaMeserosDiv.innerHTML += `<p>En el mes y año ${item.mes} El mesero ${item.nombre_mesero} tiene una amabilidad de ${parseFloat(item.promedio_amabilidad).toFixed(2)} y una exactitud de ${parseFloat(item.promedio_exactitud).toFixed(2)}</p>`;
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

function formatearFecha(fecha) {
    const fechaObj = new Date(fecha);
    const año = fechaObj.getFullYear();
    const mes = fechaObj.getMonth() + 1 < 10 ? '0' + (fechaObj.getMonth() + 1) : fechaObj.getMonth() + 1;
    const dia = fechaObj.getDate() < 10 ? '0' + fechaObj.getDate() : fechaObj.getDate();
    return `${año}-${mes}-${dia}`;
}