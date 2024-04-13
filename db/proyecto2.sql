-- Usuarios
CREATE TABLE
    Usuarios (
        ID_Usuario SERIAL PRIMARY KEY,
        Nombre VARCHAR(255) NOT NULL,
        Correo_Electronico VARCHAR(255) UNIQUE NOT NULL,
        Contrasena VARCHAR(255) NOT NULL,
        Rol VARCHAR(100) NOT NULL
    );

-- Areas
CREATE TABLE
    Areas (
        ID_Area SERIAL PRIMARY KEY,
        Nombre_Area VARCHAR(255) NOT NULL,
        Es_Fumador BOOLEAN NOT NULL,
        Puede_Mover_Mesas BOOLEAN NOT NULL
    );

-- Mesas
CREATE TABLE
    Mesas (
        ID_Mesa SERIAL PRIMARY KEY,
        ID_Area INTEGER NOT NULL REFERENCES Areas (ID_Area),
        Capacidad INTEGER NOT NULL CHECK (Capacidad > 0),
        Estado VARCHAR(100) NOT NULL CHECK (Estado IN ('disponible', 'ocupada'))
    );

-- Cuentas
CREATE TABLE
    Cuentas (
        ID_Cuenta SERIAL PRIMARY KEY,
        ID_Mesa INTEGER NOT NULL REFERENCES Mesas (ID_Mesa),
        Estado VARCHAR(100) NOT NULL CHECK (Estado IN ('abierta', 'cerrada')),
        Fecha_Apertura TIMESTAMP NOT NULL,
        Fecha_Cierre TIMESTAMP
    );

-- Pedidos
CREATE TABLE
    Pedidos (
        ID_Pedido SERIAL PRIMARY KEY,
        ID_Cuenta INTEGER NOT NULL REFERENCES Cuentas (ID_Cuenta),
        Fecha_Hora_Pedido TIMESTAMP NOT NULL
    );

-- Platos y Bebidas (Items)
CREATE TABLE
    Items (
        ID_Item SERIAL PRIMARY KEY,
        Nombre VARCHAR(255) NOT NULL,
        Descripcion TEXT,
        Precio NUMERIC(10, 2) NOT NULL CHECK (Precio > 0),
        Tipo VARCHAR(100) NOT NULL CHECK (Tipo IN ('plato', 'bebida'))
    );

-- Detalle_Pedido
CREATE TABLE
    Detalle_Pedido (
        ID_Detalle SERIAL PRIMARY KEY,
        ID_Pedido INTEGER NOT NULL REFERENCES Pedidos (ID_Pedido),
        ID_Item INTEGER NOT NULL REFERENCES Items (ID_Item),
        Cantidad INTEGER NOT NULL CHECK (Cantidad > 0)
    );

-- Facturas
CREATE TABLE
    Facturas (
        ID_Factura SERIAL PRIMARY KEY,
        ID_Cuenta INTEGER NOT NULL REFERENCES Cuentas (ID_Cuenta),
        PedidoID INTEGER NOT NULL REFERENCES Pedidos (ID_Pedido),
        NIT_Cliente VARCHAR(20),
        Nombre_Cliente VARCHAR(255) NOT NULL,
        Direccion_Cliente VARCHAR(255),
        Total NUMERIC(10, 2) NOT NULL
        Fecha_Hora TIMESTAMP NOT NULL

    );

-- Pagos
CREATE TABLE
    Pagos (
        ID_Pago SERIAL PRIMARY KEY,
        ID_Factura INTEGER NOT NULL REFERENCES Facturas (ID_Factura),
        Monto NUMERIC(10, 2) NOT NULL CHECK (Monto > 0),
        Tipo_Pago VARCHAR(100) NOT NULL CHECK (Tipo_Pago IN ('efectivo', 'tarjeta'))
    );

-- Encuestas
CREATE TABLE
    Encuestas (
        ID_Encuesta SERIAL PRIMARY KEY,
        ID_Cuenta INTEGER NOT NULL REFERENCES Cuentas (ID_Cuenta),
        Amabilidad_Mesero INTEGER CHECK (Amabilidad_Mesero BETWEEN 1 AND 5),
        Exactitud_Pedido INTEGER CHECK (Exactitud_Pedido BETWEEN 1 AND 5)
    );

-- Quejas
CREATE TABLE
    Quejas (
        ID_Queja SERIAL PRIMARY KEY,
        ID_Cliente INTEGER NOT NULL REFERENCES Usuarios (ID_Usuario),
        Fecha_Hora TIMESTAMP NOT NULL,
        Motivo TEXT NOT NULL,
        Clasificacion INTEGER NOT NULL CHECK (Clasificacion BETWEEN 1 AND 5),
        ID_Empleado INTEGER REFERENCES Usuarios (ID_Usuario),
        ID_Item INTEGER REFERENCES Items (ID_Item)
    );

 --Indices

-- Uso de email para filtro de usuarios
CREATE INDEX idx_usuarios_correo ON Usuarios (Correo_Electronico);

-- Mejora en joins entre mesas y areas
CREATE INDEX idx_mesas_id_area ON Mesas (ID_Area);

-- Cuentas por estados
CREATE INDEX idx_cuentas_estado ON Cuentas (Estado);

-- pedidos por fecha y hora
CREATE INDEX idx_pedidos_fecha_hora ON Pedidos (Fecha_Hora_Pedido);

-- items por tipo
CREATE INDEX idx_items_tipo ON Items (Tipo);

-- join DetallePedido y Pedido
CREATE INDEX idx_detalle_pedido_id_pedido ON Detalle_Pedido (ID_Pedido);
CREATE INDEX idx_detalle_pedido_id_item ON Detalle_Pedido (ID_Item);

-- For Mejora en joins entre cuenta y pedidos
CREATE INDEX idx_facturas_id_cuenta ON Facturas (ID_Cuenta);
CREATE INDEX idx_facturas_pedido ON Facturas (PedidoID);

-- Index para busqueda de pagos por tipo
CREATE INDEX idx_pagos_tipo ON Pagos (Tipo_Pago);

-- filtros para orden de encuestas 
CREATE INDEX idx_encuestas_id_cuenta ON Encuestas (ID_Cuenta);

-- For busqueda de quejas
CREATE INDEX idx_quejas_cliente ON Quejas (ID_Cliente);
CREATE INDEX idx_quejas_empleado ON Quejas (ID_Empleado);
CREATE INDEX idx_quejas_item ON Quejas (ID_Item);
CREATE INDEX idx_quejas_fecha_hora ON Quejas (Fecha_Hora);


    
--  Triggers
-- Actualizar estado de mesas
CREATE TRIGGER update_statemesa_aftrpedido
AFTER INSERT ON Pedidos
FOR EACH ROW
EXECUTE FUNCTION update_statemesa_aftrpedido();

CREATE TRIGGER update_mesa_state_aftercierre
AFTER UPDATE OF Estado ON Cuentas
FOR EACH ROW
WHEN (NEW.Estado = 'cerrada')
EXECUTE FUNCTION update_mesastate();

-- Creado de facturas automatica
CREATE TRIGGER create_factura_on_cuenta_close
AFTER UPDATE OF Estado ON Cuentas
FOR EACH ROW
WHEN (NEW.Estado = 'cerrada')
EXECUTE FUNCTION create_factura_from_cuenta();

-- Calculo de facturas
CREATE TRIGGER create_factura_on_cuenta_close
AFTER UPDATE OF Estado ON Cuentas
FOR EACH ROW
WHEN (NEW.Estado = 'cerrada')
EXECUTE FUNCTION create_factura_from_cuenta();

--Actualización de Inventario
CREATE TRIGGER inventario_after_pedido
AFTER INSERT ON Detalle_Pedido
FOR EACH ROWMesas
Abrir cuenta de mesa
POST /api/mesas/:id_mesa/abrir-cuenta - Abrir una nueva cuenta para una mesa.
Cerrar cuenta de mesa
PUT /api/cuentas/:id_cuenta/cerrar - Cerrar la cuenta de una mesa.

EXECUTE FUNCTION update_inventory();


--Cálculo de Propina
CREATE TRIGGER calculate_tip_on_cierre
AFTER UPDATE OF Estado ON Pedidos
FOR EACH ROW
WHEN (NEW.Estado = 'cerrado')
EXECUTE FUNCTION calculate_tip();

--Feedback
CREATE TRIGGER update_feedback
AFTER INSERT ON Encuestas
FOR EACH ROW
EXECUTE FUNCTION update_waiter_feedback_score();



