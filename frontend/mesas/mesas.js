document.addEventListener('DOMContentLoaded', function() {
    fetchTables();
    setupEventListeners();
});

function fetchTables() {
    fetch('http://localhost:3000/api/mesas')
        .then(response => response.ok ? response.json() : Promise.reject(`Network response was not ok, status: ${response.status}`))
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
    const addOrderForm = document.getElementById('addOrderForm');
    if (addOrderForm) {
        addOrderForm.addEventListener('submit', submitOrder);
    } else {
        // Este mensaje ayudará a identificar si el elemento no existe cuando se intenta añadir el listener.
        console.error('AddOrderForm not found, cannot attach event listener');
    }
}

function openAccount(id_mesa) {
    fetch(`http://localhost:3000/api/mesas/${id_mesa}/abrir-cuenta`, { method: 'POST' })
        .then(response => response.ok ? response.json() : Promise.reject('Failed to open account'))
        .then(() => {
            alert('Account opened successfully!');
            fetchTables();
        })
        .catch(error => {
            console.error('Error opening account:', error);
            alert('Failed to open account: ' + error);
        });
}

function closeAccount(id_cuenta) {
    fetch(`http://localhost:3000/api/mesas/cuentas/${id_cuenta}/cerrar`, { method: 'PUT' })
        .then(response => response.ok ? response.json() : Promise.reject('Failed to close account'))
        .then(() => {
            alert('Account closed successfully!');
            fetchTables();
        })
        .catch(error => {
            console.error('Error closing account:', error);
            alert('Failed to close account: ' + error);
        });
        openInvoiceModal(id_cuenta);
}

function openOrderModal(idCuenta) {
    document.getElementById('idCuenta').value = idCuenta;
    fetchItems();
    document.getElementById('addOrderModal').style.display = 'block';
}

function fetchItems() {
    fetch('http://localhost:3000/api/items')
        .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch items'))
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

let pedidoActual = [];

function addSelectedItem() {
    const select = document.getElementById('itemSelect');
    const idItem = select.value;
    const itemName = select.options[select.selectedIndex].text;
    const existingItemIndex = pedidoActual.findIndex(item => item.idItem === idItem);
    
    if (existingItemIndex !== -1) {
        // El ítem ya existe en el pedido, incrementa la cantidad
        pedidoActual[existingItemIndex].cantidad += 1;
    } else {
        // El ítem es nuevo en el pedido, añádelo
        pedidoActual.push({ idItem, itemName, cantidad: 1 });
    }

    updateSelectedItemsList();
}
function updateSelectedItemsList() {
    const lista = document.getElementById('selectedItemsList');
    lista.innerHTML = '';  // Clear current list

    pedidoActual.forEach((item, index) => {
        const itemElement = document.createElement('li');
        itemElement.textContent = `${item.itemName} - Cantidad: `;

        // Input para modificar cantidad
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.min = '1';
        quantityInput.value = item.cantidad;
        quantityInput.style.width = '50px';

      
        // Botón para eliminar ítem
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.onclick = () => removeItem(index);  // Función para eliminar ítem
        
        itemElement.appendChild(quantityInput);
        itemElement.appendChild(deleteButton);
        lista.appendChild(itemElement);
    });
}


function removeItem(index) {
    pedidoActual.splice(index, 1);  // Elimina el ítem del array
    updateSelectedItemsList();  // Actualiza la lista visual
}

function submitOrder(event) {
    event.preventDefault();
    const idCuenta = parseInt(document.getElementById('idCuenta').value);
    const detalles = pedidoActual.map(item => ({
        idItem: parseInt(item.idItem),
        cantidad: item.cantidad
    }));

    fetch('http://localhost:3000/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCuenta, detalles })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to submit order with status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Pedido añadido:', data);
        alert('Pedido enviado correctamente y resumen generado!');
        pedidoActual = [];
        updateSelectedItemsList();
        closeOrderModal();
        fetchTables();
        fetchOrderDetails(data.pedido.id_pedido);
    })
    .catch(error => {
        console.error('Error al enviar el pedido:', error);
        alert('Error al enviar el pedido: ' + error.message);
    });
}
function fetchOrderDetails(idPedido) {
    fetch(`http://localhost:3000/api/pedidos/'/:id_pedido'`)
    .then(response => response.ok ? response.json() : Promise.reject(`Failed to fetch order details, status: ${response.status}`))
    .then(detalles => {
        console.log('Detalles del pedido:', detalles);
        displayOrderDetails(detalles);
    })
    .catch(error => {
        console.error('Error al obtener los detalles del pedido:', error);
        alert('Error al obtener los detalles del pedido: ' + error.message);
    });
}

function displayOrderDetails(detalles) {
    const detallesContainer = document.getElementById('orderDetails'); // Asegúrate de que este elemento existe en tu HTML
    detallesContainer.innerHTML = ''; // Limpiar detalles anteriores
    detalles.forEach(detalle => {
        const detalleElement = document.createElement('div');
        detalleElement.innerHTML = `
            <p>Ítem: ${detalle.nombre} - Cantidad: ${detalle.cantidad} - Precio unitario: $${detalle.precio.toFixed(2)} - Subtotal: $${(detalle.cantidad * detalle.precio).toFixed(2)}</p>
        `;
        detallesContainer.appendChild(detalleElement);
    });
}



function closeOrderModal() {
    document.getElementById('addOrderModal').style.display = 'none';
}
function openInvoiceModal(idCuenta) {
    document.getElementById('invoiceAccountId').value = idCuenta;
    document.getElementById('invoiceModal').style.display = 'block';
}

function closeInvoiceModal() {
    document.getElementById('invoiceModal').style.display = 'none';
}

function submitInvoice() {
    const idCuenta = document.getElementById('invoiceAccountId').value;
    const nitCliente = document.getElementById('customerNIT').value;
    const nombreCliente = document.getElementById('customerName').value;
    const direccionCliente = document.getElementById('customerAddress').value;

    fetch(`http://localhost:3000/api/cuentas/${idCuenta}/pedido`, {
        method: 'GET'
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch order details'))
    .then(orderDetails => {
        const invoiceData = {
            id_cuenta: parseInt(idCuenta),
            nit_cliente: nitCliente,
            nombre_cliente: nombreCliente,
            direccion_cliente: direccionCliente,
            detalles: orderDetails
        };

        return fetch('http://localhost:3000/api/facturas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoiceData)
        });
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to generate invoice'))
    .then(invoice => {
        console.log('Factura generada:', invoice);
        displayInvoiceDetails(invoice);
        alert('Factura generada exitosamente!');
        closeInvoiceModal();
        fetchTables(); // Refresca la lista de mesas para actualizar estados
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    });
}

function displayInvoiceDetails(invoice) {
    document.getElementById('invoiceAccountId').textContent = invoice.id_cuenta;
    document.getElementById('invoiceDate').textContent = new Date().toLocaleString(); // Ejemplo de fecha/hora actual
    const itemsList = document.getElementById('invoiceItems');
    itemsList.innerHTML = '';

    invoice.detalles.forEach(item => {
        const itemElement = document.createElement('li');
        itemElement.textContent = `Item ID: ${item.id_item}, Nombre: ${item.nombre}, Precio: $${item.precio}, Cantidad: ${item.cantidad}, Subtotal: $${item.subtotal}`;
        itemsList.appendChild(itemElement);
    });

    const total = invoice.detalles.reduce((acc, item) => acc + item.subtotal, 0);
    document.getElementById('invoiceTotal').textContent = total.toFixed(2);
}

