// reporte de los platos mas pedidos 
function obtenerReportePlatosMasPedidos() {
    const fechaInicio = document.getElementById('fechaInicioPlatos').value;
    const fechaFin = document.getElementById('fechaFinPlatos').value;
    // Resto del código...
}

function obtenerReporteHorarioMasPedidos() {
    const fechaInicio = document.getElementById('fechaInicioHorario').value;
    const fechaFin = document.getElementById('fechaFinHorario').value;
    // Resto del código...
}

function obtenerReportePromedioTiempoComida() {
    const fechaInicio = document.getElementById('fechaInicioTiempoComida').value;
    const fechaFin = document.getElementById('fechaFinTiempoComida').value;
    // Resto del código...
}

function obtenerReporteQuejasPorEmpleado() {
    const fechaInicio = document.getElementById('fechaInicioQuejasEmpleado').value;
    const fechaFin = document.getElementById('fechaFinQuejasEmpleado').value;
    // Resto del código...
}

function obtenerReporteQuejasPorPlato() {
    const fechaInicio = document.getElementById('fechaInicioQuejasPlato').value;
    const fechaFin = document.getElementById('fechaFinQuejasPlato').value;
    // Resto del código...
}

function obtenerReporteEficienciaMeseros() {
    const fechaInicio = document.getElementById('fechaInicioEficienciaMeseros').value;
    const fechaFin = document.getElementById('fechaFinEficienciaMeseros').value;
    // Resto del código...
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
