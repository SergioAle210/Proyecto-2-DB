document.addEventListener('DOMContentLoaded', function() {
    fetchTables();
});

function fetchTables() {
    fetch('http://localhost:3000/api/mesas')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const container = document.getElementById('tableContainer');
        container.innerHTML = '';  // Clear previous entries
        if (!data.length) {
            container.innerHTML = '<p>No tables available.</p>';
            return;
        }
        data.forEach(mesa => {
            const tableDiv = document.createElement('div');
            tableDiv.className = 'table';
            tableDiv.innerHTML = `
                <h3>Mesa ${mesa.id_mesa} - Capacidad: ${mesa.capacidad}</h3>
                <p>Status: ${mesa.estado}</p>
            `;
            // Asegurarse de que el estado de la cuenta y el id_cuenta estén correctamente manejados
            if (mesa.cuenta_estado === 'abierta' && mesa.id_cuenta) {
                const closeButton = document.createElement('button');
                closeButton.textContent = 'Cerrar Cuenta';
                closeButton.onclick = function() { closeAccount(mesa.id_cuenta); };
                tableDiv.appendChild(closeButton);
            } else {
                const openButton = document.createElement('button');
                openButton.textContent = 'Abrir Cuenta';
                openButton.onclick = function() { openAccount(mesa.id_mesa); };
                tableDiv.appendChild(openButton);
            }
        
            container.appendChild(tableDiv);
        });
        
    })
    .catch(error => {
        console.error('Error loading tables:', error);
        document.getElementById('tableContainer').innerHTML = '<p>Error loading tables. Check console for details.</p>';
    });
}

function openAccount(id_mesa) {
    fetch(`http://localhost:3000/api/mesas/${id_mesa}/abrir-cuenta`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to open account');
        }
        return response.json();
    })
    .then(data => {
        alert('Account opened successfully!');
        fetchTables();  // Refresh the table list
    })
    .catch(error => {
        console.error('Error opening account:', error);
        alert('Failed to open account: ' + error.message);
    });
}

function closeAccount(id_cuenta) {
    fetch(`http://localhost:3000/api/mesas/cuentas/${id_cuenta}/cerrar`, {
        method: 'PUT'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to close account');
        }
        return response.json();
    })
    .then(data => {
        alert('Account closed successfully!');
        fetchTables();  // Refresh the table list
    })
    .catch(error => {
        console.error('Error closing account:', error);
        alert('Failed to close account: ' + error.message);
    });
}
