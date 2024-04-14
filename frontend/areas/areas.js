document.getElementById('areaForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const nombreArea = document.getElementById('nombreArea').value;
    const esFumador = document.getElementById('esFumador').checked;

    const areaData = {
        nombre_area: nombreArea,
        es_fumador: esFumador,
    };

    fetch('http://localhost:3000/api/areas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(areaData),
    })
    .then(response => response.json())
    .then(data => {
        alert('Área creada con éxito: ' + JSON.stringify(data));
        // Aquí puedes agregar código para actualizar la lista de áreas sin recargar la página
    })
    .catch(error => alert('Error al crear área: ' + error));
});

// Función para listar áreas
function listarAreas() {
    fetch('http://localhost:3000/api/areas')
    .then(response => response.json())
    .then(data => {
        const lista = document.getElementById('listaAreas');
        lista.innerHTML = ''; // Limpiar lista actual
        data.forEach(area => {
            lista.innerHTML += `<div>${area.nombre_area} - Fumadores: ${area.es_fumador ? 'Sí' : 'No'}</div>`;
        });
    })
    .catch(error => alert('Error al listar áreas: ' + error));
}

// Inicializar la lista de áreas al cargar la página
document.addEventListener('DOMContentLoaded', listarAreas);
