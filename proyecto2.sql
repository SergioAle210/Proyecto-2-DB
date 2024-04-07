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
        NIT_Cliente VARCHAR(20),
        Nombre_Cliente VARCHAR(255) NOT NULL,
        Direccion_Cliente VARCHAR(255),
        Total NUMERIC(10, 2) NOT NULL
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