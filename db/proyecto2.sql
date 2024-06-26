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
        ID_Empleado INTEGER NOT NULL REFERENCES Usuarios (ID_Usuario),
        Estado VARCHAR(100) NOT NULL CHECK (Estado IN ('abierta', 'cerrada')),
        Fecha_Apertura TIMESTAMP NOT NULL,
        Fecha_Cierre TIMESTAMP
    );

-- Pedidos
CREATE TABLE
    Pedidos (
        ID_Pedido SERIAL PRIMARY KEY,
        ID_Cuenta INTEGER NOT NULL REFERENCES Cuentas (ID_Cuenta),
        Fecha_Hora_Pedido TIMESTAMP NOT NULL,
        Estado VARCHAR(255)
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
        NIT_Cliente VARCHAR(20),
        Nombre_Cliente VARCHAR(255),
        Direccion_Cliente VARCHAR(255),
        Total NUMERIC(10, 2) NOT null,
        FechaHora TIMESTAMP NOT NULL
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
        Exactitud_Pedido INTEGER CHECK (Exactitud_Pedido BETWEEN 1 AND 5),
        Fecha_Hora TIMESTAMP NOT NULL
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
CREATE OR REPLACE FUNCTION update_mesastate()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE mesas SET estado = 'disponible'
    WHERE id_mesa = (SELECT id_mesa FROM cuentas WHERE id_cuenta = NEW.id_cuenta);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mesa_state_aftercierre
AFTER UPDATE OF Estado ON Cuentas
FOR EACH ROW
WHEN (NEW.Estado = 'cerrada')
EXECUTE FUNCTION update_mesastate();

CREATE OR REPLACE FUNCTION create_factura_from_cuenta()
RETURNS TRIGGER AS $$
DECLARE
    total_factura NUMERIC;
BEGIN
    -- Calcular el total de la factura sumando todos los precios de los items pedidos
    SELECT SUM(i.precio * dp.cantidad) INTO total_factura
    FROM detalle_pedido dp
    INNER JOIN items i ON dp.id_item = i.id_item
    WHERE dp.id_pedido IN (SELECT id_pedido FROM pedidos WHERE id_cuenta = NEW.id_cuenta);

    IF total_factura IS NULL THEN
        RAISE EXCEPTION 'No se encontraron pedidos para esta cuenta.';
    END IF;

    -- Insertar una nueva factura con el total calculado y otros detalles de cliente
    INSERT INTO facturas (id_cuenta, FechaHora, total)
    SELECT NEW.id_cuenta, NOW(), total_factura
    FROM cuentas c
    WHERE c.id_cuenta = NEW.id_cuenta;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER create_factura_on_cuenta_close
AFTER UPDATE OF estado ON cuentas
FOR EACH ROW
WHEN (NEW.estado = 'cerrada')
EXECUTE FUNCTION create_factura_from_cuenta();


--Cálculo de Propina
CREATE OR REPLACE FUNCTION calculate_tip()
RETURNS TRIGGER AS $$
DECLARE
    total_pedido NUMERIC;
    propina NUMERIC;
BEGIN
    -- Obtener el total del pedido
    SELECT SUM(dp.cantidad * i.precio) INTO total_pedido
    FROM detalle_pedido dp
    JOIN items i ON dp.id_item = i.id_item
    WHERE dp.id_pedido = NEW.id_pedido;

    -- Calcular la propina como el 10% del total del pedido
    propina := total_pedido * 0.10;

    -- Actualizar la tabla de pedidos con la propina calculada
    UPDATE pedidos SET propina = propina WHERE id_pedido = NEW.id_pedido;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_tip_on_cierre
AFTER UPDATE OF estado ON pedidos
FOR EACH ROW
WHEN (NEW.estado = 'cerrado')
EXECUTE FUNCTION calculate_tip();

CREATE TABLE bitacora (
	id SERIAL PRIMARY KEY,
	fechahora TIMESTAMP NOT NULL DEFAULT NOW(),
	accion VARCHAR NOT NULL,
	nombre_tabla VARCHAR NOT NULL
);

CREATE OR REPLACE FUNCTION registro_movimientos()
RETURNS TRIGGER AS 
$BODY$
BEGIN
	INSERT INTO bitacora(accion, nombre_tabla)
	VALUES (TG_OP, TG_TABLE_NAME);

	RETURN NEW;
END;
$BODY$
LANGUAGE 'plpgsql';

-- Usuarios
CREATE TRIGGER movimientos_usuarios
AFTER INSERT OR UPDATE OR DELETE 
ON Usuarios
FOR EACH ROW 
EXECUTE PROCEDURE registro_movimientos();

-- Areas
CREATE TRIGGER movimientos_areas
AFTER INSERT OR UPDATE OR DELETE 
ON Areas
FOR EACH ROW 
EXECUTE PROCEDURE registro_movimientos();

-- Mesas
CREATE TRIGGER movimientos_mesas
AFTER INSERT OR UPDATE OR DELETE 
ON Mesas
FOR EACH ROW 
EXECUTE PROCEDURE registro_movimientos();

-- Cuentas
CREATE TRIGGER movimientos_cuentas
AFTER INSERT OR UPDATE OR DELETE 
ON Cuentas
FOR EACH ROW 
EXECUTE PROCEDURE registro_movimientos();

-- Pedidos
CREATE TRIGGER movimientos_pedidos
AFTER INSERT OR UPDATE OR DELETE 
ON Pedidos
FOR EACH ROW 
EXECUTE PROCEDURE registro_movimientos();

-- Platos y Bebidas (Items)
CREATE TRIGGER movimientos_items
AFTER INSERT OR UPDATE OR DELETE 
ON Items
FOR EACH ROW 
EXECUTE PROCEDURE registro_movimientos();

-- Detalle_Pedido
CREATE TRIGGER movimientos_detalle_pedido
AFTER INSERT OR UPDATE OR DELETE 
ON Detalle_Pedido
FOR EACH ROW 
EXECUTE PROCEDURE registro_movimientos();

-- Facturas
CREATE TRIGGER movimientos_facturas
AFTER INSERT OR UPDATE OR DELETE 
ON Facturas
FOR EACH ROW 
EXECUTE PROCEDURE registro_movimientos();

-- Pagos
CREATE TRIGGER movimientos_pagos
AFTER INSERT OR UPDATE OR DELETE 
ON Pagos
FOR EACH ROW 
EXECUTE PROCEDURE registro_movimientos();

-- Encuestas
CREATE TRIGGER movimientos_encuestas
AFTER INSERT OR UPDATE OR DELETE 
ON Encuestas
FOR EACH ROW 
EXECUTE PROCEDURE registro_movimientos();

-- Quejas
CREATE TRIGGER movimientos_quejas
AFTER INSERT OR UPDATE OR DELETE 
ON Quejas
FOR EACH ROW 
EXECUTE PROCEDURE registro_movimientos();

