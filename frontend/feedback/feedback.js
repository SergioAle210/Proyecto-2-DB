document.getElementById('formEncuesta').addEventListener('submit', function(event) {
    event.preventDefault();
    const encuesta = {
        id_cuenta: parseInt(document.getElementById('idCuentaEncuesta').value),
        amabilidad_mesero: parseInt(document.getElementById('amabilidadMesero').value),
        exactitud_pedido: parseInt(document.getElementById('exactitudPedido').value)
    };

    fetch('http://localhost:3000/api/feedback/encuestas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(encuesta),
    })
    .then(response => response.json())
    .then(data => alert('Encuesta registrada con éxito: ' + JSON.stringify(data)))
    .catch(error => alert('Error al registrar encuesta: ' + error));
});

document.getElementById('formQueja').addEventListener('submit', function(event) {
    event.preventDefault();
    const queja = {
        id_cliente: parseInt(document.getElementById('idClienteQueja').value),
        motivo: document.getElementById('motivoQueja').value,
        clasificacion: parseInt(document.getElementById('clasificacionQueja').value),
        id_empleado: parseInt(document.getElementById('idEmpleadoQueja').value),
        id_item: parseInt(document.getElementById('itemSelect').value)
    };

    fetch('http://localhost:3000/api/feedback/quejas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(queja),
    })
    .then(response => response.json())
    .then(data => alert('Queja registrada con éxito: ' + JSON.stringify(data)))
    .catch(error => alert('Error al registrar queja: ' + error));
});
