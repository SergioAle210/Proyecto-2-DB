document.addEventListener('DOMContentLoaded', function() {
    fetchTables();
    document.getElementById('submitInvoiceBtn').addEventListener('click', submitInvoice);

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
                const puedeMover = mesa.area_puede_mover_mesas ? "sí" : "no";

                tableDiv.className = 'table';
                tableDiv.innerHTML = `
                    <h3>Mesa ${mesa.id_mesa} - Capacidad: ${mesa.capacidad}</h3>
                    <p>Status: ${mesa.estado}</p>
                    <p>La mesa se encuentra en el area de <strong>${mesa.nombre_area}</strong>. La mesa de puede mover: ${puedeMover} </p>

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

function addPayment() {
    // Obtain the payment method element
    const paymentMethodElement = document.getElementById('paymentType');

    // Log element to console to debug
    console.log("paymentMethodElement:", paymentMethodElement);

    if (!paymentMethodElement) {
        alert("Error: Elemento del método de pago no está disponible.");
        return;
    }

    const paymentMethod = paymentMethodElement.value;

    // Add to a list or container of payment methods
    const addedPayments = document.getElementById('addedPayments');
    if (!addedPayments) {
        console.error("addedPayments container not found");
        alert("Error: El contenedor para métodos de pago añadidos no está disponible.");
        return;
    }
    const paymentInfo = document.createElement('p');
    paymentInfo.textContent = `Método: ${paymentMethod}`;
    addedPayments.appendChild(paymentInfo);

    // Reset the select to allow more entries
    paymentMethodElement.selectedIndex = 0;
}



function submitInvoice() {
    console.log('submitInvoice called');

    console.log(document.getElementById('invoiceAccountId'));
    console.log(document.getElementById('customerNIT'));
    console.log(document.getElementById('customerName'));
    console.log(document.getElementById('customerAddress'));
    console.log(document.getElementById('paymentType'));
    console.log(document.getElementById('paymentAmount'));
    
    const idCuenta = document.getElementById('invoiceAccountId').textContent; // Asegúrate que esto tenga el valor correcto
    const nitCliente = document.getElementById('customerNIT').value;
    const nombreCliente = document.getElementById('customerName').value;
    const direccionCliente = document.getElementById('customerAddress').value;
    const paymentType = document.getElementById('paymentType').value;
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);

    // Validaciones
    if (!nitCliente || !nombreCliente || !direccionCliente || isNaN(paymentAmount) || paymentAmount <= 0) {
        alert('Por favor, complete todos los campos y asegúrese de que los valores son correctos.');
        return;
    }

    // Datos de la factura
    const invoiceData = {
        id_cuenta: parseInt(idCuenta),
        nit_cliente: nitCliente,
        nombre_cliente: nombreCliente,
        direccion_cliente: direccionCliente,
        // Suponiendo que 'orderDetails' es donde recoges los detalles del pedido.
        // Esta variable debe estar definida y contener los detalles del pedido.
        pagos: [{
            tipo_pago: paymentType,
            monto: paymentAmount
        }]
    };

    // Enviar datos al servidor para crear la factura y registrar el pago
    fetch('http://localhost:3000/api/facturas/facturacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
    })
    .then(response => {
        if (!response.ok) throw new Error('No se pudo generar la factura.');
        return response.json();
    })
    .then(data => {
        alert('Factura y pago registrados correctamente.');
        console.log('Factura y pago:', data);
        closeInvoiceModal(); // Cierra el modal de factura
        // Aquí deberías también limpiar los campos o actualizar la UI como sea necesario.
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al procesar la factura: ' + error.message);
    });
}

function closeInvoiceModal() {
    document.getElementById('invoiceModal').style.display = 'none';
    // Aquí puedes también resetear el formulario si lo consideras necesario.
}
