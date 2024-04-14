function abrirCuenta() {
    const idMesa = document.getElementById('openMesaId').value;
    fetch(`http://localhost:3000/api/mesas/${idMesa}/abrir-cuenta`, {
        method: 'POST'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Respuesta del servidor no es OK');
      }
      return response.json();
    })
    .then(data => alert('Cuenta abierta: ' + JSON.stringify(data)))
    .catch(error => {
        console.error('Error al abrir cuenta:', error);
        alert('Error al abrir cuenta: ' + error);
    });
}
