document.addEventListener('DOMContentLoaded', function() {
    fetchTables();
    setupEventListeners();
});

function fetchTables() {
    fetch('http://localhost:3000/api/mesas')
        .then(response => {
            if (!response.ok) throw new Error(`Network response was not ok, status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            const container = document.getElementById('tableContainer');
            container.innerHTML = '';
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
                if (mesa.cuenta_estado === 'abierta' && mesa.id_cuenta) {
                    const closeButton = document.createElement('button');
                    closeButton.textContent = 'Cerrar Cuenta';
                    closeButton.onclick = () => closeAccount(mesa.id_cuenta);
                    tableDiv.appendChild(closeButton);

                    const orderButton = document.createElement('button');
                    orderButton.textContent = 'Añadir Pedido';
                    orderButton.onclick = () => openOrderModal(mesa.id_cuenta);
                    tableDiv.appendChild(orderButton);
                } else {
                    const openButton = document.createElement('button');
                    openButton.textContent = 'Abrir Cuenta';
                    openButton.onclick = () => openAccount(mesa.id_mesa);
                    tableDiv.appendChild(openButton);
                }
                container.appendChild(tableDiv);
            });
        })
        .catch(error => console.error('Error loading tables:', error));
}

function setupEventListeners() {
    document.getElementById('addOrderForm').addEventListener('submit', submitOrder);
}

function openAccount(id_mesa) {
    fetch(`http://localhost:3000/api/mesas/${id_mesa}/abrir-cuenta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_mesa })
    })
    .then(response => {
        if (!response.ok) throw new Error(`Failed to open account with status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        alert('Account opened successfully!');
        fetchTables();
    })
    .catch(error => {
        console.error('Error opening account:', error);
        alert('Failed to open account: ' + error.message);
    });
}

function closeAccount(id_cuenta) {
    fetch(`http://localhost:3000/api/mesas/cuentas/${id_cuenta}/cerrar`, { method: 'PUT' })
        .then(response => {
            if (!response.ok) throw new Error('Failed to close account');
            return response.json();
        })
        .then(() => {
            alert('Account closed successfully.');
            openInvoiceModal(id_cuenta);
            fetchTables();
        })
        .catch(error => {
            console.error('Error closing account:', error);
            alert('Failed to close account: ' + error.message);
        });
}

function openInvoiceModal(idCuenta) {
    document.getElementById('invoiceAccountId').textContent = idCuenta;
    document.getElementById('invoiceModal').style.display = 'block';
}

function openOrderModal(idCuenta) {
    document.getElementById('idCuenta').value = idCuenta;
    fetchItems();
    document.getElementById('addOrderModal').style.display = 'block';
}

function fetchItems() {
    fetch('http://localhost:3000/api/items')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch items');
            return response.json();
        })
        .then(items => populateItemSelect(items))
        .catch(error => console.error('Error fetching items:', error));
}

function populateItemSelect(items) {
    const select = document.getElementById('itemSelect');
    select.innerHTML = '';
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id_item;
        option.textContent = `${item.nombre} - $${parseFloat(item.precio).toFixed(2)}`;
        select.appendChild(option);
    });
}

function submitOrder(event) {
    event.preventDefault();
    const idCuenta = parseInt(document.getElementById('idCuenta').value);
    const detalles = Array.from(document.querySelectorAll('#selectedItemsList li')).map(item => {
        return {
            idItem: item.dataset.idItem,
            cantidad: parseInt(item.querySelector('input[type="number"]').value)
        };
    });

    fetch('http://localhost:3000/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCuenta, detalles })
    })
    .then(response => {
        if (!response.ok) throw new Error(`Failed to submit order with status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log('Pedido añadido:', data);
        alert('Pedido enviado correctamente!');
        closeOrderModal();
        fetchTables();
    })
    .catch(error => {
        console.error('Error submitting order:', error);
        alert('Error al enviar el pedido: ' + error.message);
    });
}

function closeOrderModal() {
    document.getElementById('addOrderModal').style.display = 'none';
}

function addSelectedItem() {
    const select = document.getElementById('itemSelect');
    const idItem = select.value;
    const itemName = select.options[select.selectedIndex].text;
    const price = parseFloat(select.options[select.selectedIndex].textContent.split('- $')[1]);
    const lista = document.getElementById('selectedItemsList');
    let item = lista.querySelector(`li[data-id-item="${idItem}"]`);
    if (item) {
        let quantityInput = item.querySelector('input[type="number"]');
        quantityInput.value = parseInt(quantityInput.value) + 1;
    } else {
        item = document.createElement('li');
        item.dataset.idItem = idItem;
        item.innerHTML = `${itemName} - $${price.toFixed(2)} <input type="number" value="1" min="1"> <button onclick="removeItem(this)">Eliminar</button>`;
        lista.appendChild(item);
    }
}

function removeItem(button) {
    let item = button.parentNode;
    item.remove();
}