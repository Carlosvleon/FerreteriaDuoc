

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Eliminar todas las tablas en el orden correcto (evitando errores de dependencias)

DROP TABLE IF EXISTS precios_online CASCADE;
DROP TABLE IF EXISTS public.usuario_oficio CASCADE;
DROP TABLE IF EXISTS public.especializacion_oficio CASCADE;
DROP TABLE IF EXISTS public.tipo_oficio CASCADE;
DROP TABLE IF EXISTS public.detalle_carrito_compras CASCADE;
DROP TABLE IF EXISTS public.carrito_compras CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.tipo_genero CASCADE;
DROP TABLE IF EXISTS public.tipo_usuario CASCADE;
DROP TABLE IF EXISTS public.tipo_estado_usuario CASCADE;
DROP TABLE IF EXISTS public.tipo_estado_usuoficio CASCADE;
DROP TABLE IF EXISTS public.precio_online CASCADE;
DROP TABLE IF EXISTS public.bodega_producto CASCADE;
DROP TABLE IF EXISTS public.precio_producto CASCADE;
DROP TABLE IF EXISTS public.producto CASCADE;
DROP TABLE IF EXISTS public.bodega CASCADE;
DROP TABLE IF EXISTS public.sucursal CASCADE;
DROP TABLE IF EXISTS public.categoria CASCADE;
DROP TABLE IF EXISTS public.modelo CASCADE;
DROP TABLE IF EXISTS public.marca CASCADE;
DROP TABLE IF EXISTS public.invalid_tokens CASCADE;

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Eliminar secuencias si existen (opcional, dependiendo de tu configuración)
DROP SEQUENCE IF EXISTS public.tipo_usuario_id_tipo_usuario_seq CASCADE;
DROP SEQUENCE IF EXISTS public.tipo_genero_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.tipo_estado_usuario_id_seq CASCADE;

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Crear secuencias
CREATE SEQUENCE public.tipo_usuario_id_tipo_usuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.tipo_genero_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.tipo_estado_usuario_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Crear la tabla tipo_usuario
CREATE TABLE IF NOT EXISTS public.tipo_usuario
(
    id_tipo_usuario integer NOT NULL DEFAULT nextval('tipo_usuario_id_tipo_usuario_seq'::regclass),
    descripcion character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT tipo_usuario_pkey PRIMARY KEY (id_tipo_usuario)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.tipo_usuario
    OWNER to postgres;

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Crear la tabla tipo_genero
CREATE TABLE IF NOT EXISTS public.tipo_genero
(
    id integer NOT NULL DEFAULT nextval('tipo_genero_id_seq'::regclass),
    nombre character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT tipo_genero_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.tipo_genero
    OWNER to postgres;

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Crear la tabla tipo_estado_usuario
CREATE TABLE IF NOT EXISTS public.tipo_estado_usuario
(
    id integer NOT NULL DEFAULT nextval('tipo_estado_usuario_id_seq'::regclass),
    nombre character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT tipo_estado_usuario_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.tipo_estado_usuario
    OWNER to postgres;

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Crear la tabla usuarios
CREATE TABLE IF NOT EXISTS public.usuarios
(
    rut character varying(20) COLLATE pg_catalog."default" NOT NULL,
    nombre character varying(150) COLLATE pg_catalog."default" NOT NULL,
    email character varying(150) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    telefono character varying(20) COLLATE pg_catalog."default",
    direccion text COLLATE pg_catalog."default",
    foto_perfil character varying(255) COLLATE pg_catalog."default",
    portada character varying(255) COLLATE pg_catalog."default",
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    razon_social character varying(150) COLLATE pg_catalog."default",
    fecha_creacion_empresa character varying(10) COLLATE pg_catalog."default",
    estado_id integer DEFAULT 1,  -- Por defecto, "Activo"
    tipo_usuario_id integer,
    id_usuario uuid NOT NULL DEFAULT uuid_generate_v4(),
    genero_id integer DEFAULT 6,  -- Por defecto, "Prefiero no decir"
    CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario),
    CONSTRAINT usuarios_email_key UNIQUE (email),
    CONSTRAINT fk_usuario_genero FOREIGN KEY (genero_id)
        REFERENCES public.tipo_genero (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT usuarios_tipo_usuario_id_fkey FOREIGN KEY (tipo_usuario_id)
        REFERENCES public.tipo_usuario (id_tipo_usuario) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT usuarios_estado_id_fkey FOREIGN KEY (estado_id)
        REFERENCES public.tipo_estado_usuario (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.usuarios
    OWNER to postgres;

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Crear la tabla tipo_oficio
CREATE TABLE IF NOT EXISTS public.tipo_oficio
(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.tipo_oficio
    OWNER to postgres;

-- Comentario: Esta tabla almacena los oficios principales.

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Crear la tabla especializacion_oficio
CREATE TABLE IF NOT EXISTS public.especializacion_oficio
(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    oficio_id INT REFERENCES public.tipo_oficio(id)  -- Relación con el oficio principal
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.especializacion_oficio
    OWNER to postgres;

-- Comentario: Esta tabla almacena las especializaciones de cada oficio.
COMMENT ON TABLE public.especializacion_oficio IS 'Almacena las especializaciones o subcategorías de los oficios.';

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Crear la tabla tipo_estado_usuoficio
CREATE TABLE IF NOT EXISTS tipo_estado_usuoficio (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Crear la tabla usuario_oficio
CREATE TABLE IF NOT EXISTS public.usuario_oficio
(
    usuario_id UUID REFERENCES public.usuarios(id_usuario),  -- Relación con la tabla de usuarios
    oficio_id INT REFERENCES public.tipo_oficio(id),         -- Relación con el oficio principal
    especializacion_id INT REFERENCES public.especializacion_oficio(id),  -- Relación con la especialización
    PRIMARY KEY (usuario_id, oficio_id, especializacion_id)  -- Clave primaria compuesta
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.usuario_oficio
    OWNER to postgres;

ALTER TABLE public.usuario_oficio
ADD COLUMN estado_id INT REFERENCES public.tipo_estado_usuoficio(id) DEFAULT 1;

-- Comentario: Esta tabla relaciona a los usuarios con sus oficios y especializaciones.
COMMENT ON TABLE public.usuario_oficio IS 'Relaciona a los usuarios con sus oficios y especializaciones.';

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Crear la tabla tokens invalidos
CREATE TABLE IF NOT EXISTS invalid_tokens (
    token TEXT PRIMARY KEY,
    fecha_expiracion TIMESTAMP
);

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------


-- Tabla de sucursales (pensando a futuro)
CREATE TABLE sucursal (
    id_sucursal SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
	activo BOOLEAN
);
-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------


-- Tabla de marcas
CREATE TABLE marca (
    id_marca SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
	activo BOOLEAN
);
-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Tabla de modelos
CREATE TABLE modelo (
    id_modelo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
	activo BOOLEAN
);
-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Tabla de categorías
CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
	activo BOOLEAN
);

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Tabla de producto
CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    codigo_producto VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    id_marca INT NOT NULL,
    id_modelo INT,
    id_categoria INT,
	activo BOOLEAN,
    CONSTRAINT fk_producto_marca FOREIGN KEY (id_marca) REFERENCES marca(id_marca),
    CONSTRAINT fk_producto_modelo FOREIGN KEY (id_modelo) REFERENCES modelo(id_modelo),
    CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);
-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Tabla de bodegas
CREATE TABLE bodega (
    id_bodega SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_sucursal INT,
	activo BOOLEAN,
    CONSTRAINT fk_bodega_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
);
-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------


-- Tabla de historial de precios(opcoinal):
CREATE TABLE precio_producto (
    id_precio SERIAL PRIMARY KEY,
    id_producto INT NOT NULL,
    fecha TIMESTAMP DEFAULT NOW(),
    valor DECIMAL(12,2) NOT NULL,
	activo BOOLEAN,
    CONSTRAINT fk_precio_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Tabla bodega-producto:
CREATE TABLE bodega_producto (
    id_bodega_producto SERIAL PRIMARY KEY,
    id_bodega INT NOT NULL,
    id_producto INT NOT NULL,
    stock INT NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW(),
    ultimo_precio DECIMAL(12,2),
	activo BOOLEAN,
    CONSTRAINT fk_bodega_producto_bodega FOREIGN KEY (id_bodega) REFERENCES bodega(id_bodega),
    CONSTRAINT fk_bodega_producto_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);
-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

CREATE TABLE carrito_compras (
  id_carrito_compras SERIAL PRIMARY KEY,
  id_usuario UUID NOT NULL REFERENCES usuarios(id_usuario) ,
  total NUMERIC(10,2) DEFAULT 0
);

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

CREATE TABLE detalle_carrito_compras (
  id_detalle_carrito SERIAL PRIMARY KEY,
  id_carrito_compras INTEGER REFERENCES carrito_compras(id_carrito_compras),
  id_producto INTEGER NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  total NUMERIC(10,2) NOT NULL
);




-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

CREATE TABLE precios_online(
  id_producto SERIAL PRIMARY KEY,
  precio_online NUMERIC(10,2) NOT NULL
);


---------------------------------------------------------------------------------------------------
-- Se agrega inser tabla tipo_genero:
-- 
INSERT INTO public.tipo_genero(id, nombre) VALUES
(1,'Hombre'),
(2,'Mujer'),
(3,'Neutral');

---------------------------------------------------------------------------------------------------
-- Se agrega inser tabla tipo_estado_usuario:
-- 

INSERT INTO public.tipo_estado_usuario (id, nombre) VALUES
(1,'Activo'),     
(2,'Oculto'),      
(3,'Desactivado'),
(4,'Bloqueado');  

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Insertar valores iniciales en tipo_estado_usuoficio
INSERT INTO public.tipo_estado_usuoficio (nombre) VALUES
('Activo'),       -- ID 1
('Oculto'),       -- ID 2
('Desactivado'),  -- ID 3
('Bloqueado');    -- ID 4

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Insertar valores iniciales en tipo_usuario
INSERT INTO public.tipo_usuario (descripcion) VALUES
('Administrador'),          -- ID 1
('Cliente'),                -- ID 2
('Bodega');                -- ID 3

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-- Insertar valores iniciales en tipo_oficio
INSERT INTO public.tipo_oficio (nombre) VALUES
('Profesor'),
('Programador'),
('Médico'),
('Electricista'),
('Carpintero/a'),
('Plomero/a - Gasfitero/a'),
('Pintor/a'),
('Albañil'),
('Cerrajero/a'),
('Jardinero/a'),
('Técnico/a en refrigeración y aire acondicionado'),
('Técnico/a en electrodomésticos'),
('Mecánico/a automotriz'),
('Mecánico/a de motocicletas'),
('Mecánico/a de bicicletas'),
('Personal de aseo doméstico'),
('Niñero/a'),
('Cuidado de personas mayores'),
('Cuidador/a de mascotas'),
('Zapatero/a'),
('Sastre/Modista'),
('Armero/a'),
('Panadero/a'),
('Relojero/a'),
('Tejedor/a y artesano/a textil'),
('Escultor/a'),
('Restaurador/a de arte y antigüedades'),
('Ceramista'),
('Ilustrador/a'),
('Peletero/a'),
('Luthier'),
('Calígrafo/a'),
('Rotulista de carteles a mano'),
('Reparador/a de paraguas y bastones'),
('Fotógrafo/a'),
('Diseñador/a gráfico/a'),
('Tatuador/a'),
('Barbero/a - Peluquero/a'),
('Cocinero/a - Chef'),
('Agricultor/a'),
('Pescador/a'),
('Curtidor/a de pieles'),
('Vidriero/a'),
('Orfebre'),
('Marmolista'),
('Tapicero/a'),
('Escayolista'),
('Sombrerero/a'),
('Flebotomista'),
('Técnico/a en prótesis dentales'),
('Técnico/a en sonido y grabación'),
('Administrador/a'),
('Contador/a'),
('Secretario/a ejecutivo/a'),
('Asistente administrativo/a'),
('Recursos Humanos'),
('Analista financiero/a'),
('Gestor/a de proyectos'),
('Consultor/a empresarial'),
('Especialista en marketing digital'),
('Corredor/a de propiedades'),
('Abogado/a'),
('Notario/a'),
('Juez/a'),
('Procurador/a'),
('Asesor/a legal'),
('Psicólogo/a'),
('Nutricionista'),
('Fisioterapeuta'),
('Terapeuta ocupacional'),
('Entrenador/a personal'),
('Masajista'),
('Homeópata'),
('Tutor/a particular'),
('Intérprete de lenguaje de señas'),
('Coach de vida'),
('Instructor/a de conducción'),
('Chofer particular'),
('Repartidor/a'),
('Mensajero/a'),
('Conductor/a de transporte escolar'),
('Técnico/a en ascensores'),
('Técnico/a en calefacción'),
('Técnico/a en sistemas de seguridad'),
('Técnico/a en paneles solares'),
('Guía turístico/a'),
('Bibliotecario/a'),
('Actor/actriz'),
('Director/a de cine'),
('Coreógrafo/a'),
('Analista de datos'),
('Administrador/a de servidores'),
('Ingeniero/a en redes');

-- Insertar valores en especializacion_oficio
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
-- Profesor
('Lenguaje', 1),
('Matemáticas', 1),
('Historia', 1),
('Ciencias', 1),
('Educación física', 1),


-- Programador
('Frontend', 2),
('Backend', 2),
('Fullstack', 2),
('Especialista en ciberseguridad', 2),
('Desarrollador/a de videojuegos', 2),
('Desarrollador/a de inteligencia artificial', 2),


-- Médico
('Cardiólogo', 3),
('Pediatra', 3),
('Dermatólogo', 3),
('Neurólogo/a', 3),
('Oncólogo/a', 3),
('Ginecólogo/a', 3),
('Traumatólogo/a', 3),
('Cirujano/a', 3),

-- Electricista
('Residencial', 4),
('Industrial', 4),
('Automotriz', 4),
('Instalador/a eléctrico/a', 4),
('Técnico/a en domótica', 4),
('Técnico/a en redes eléctricas', 4),


-- Carpintero/a
('Carpintero/a de muebles', 5),
('Carpintero/a de obra', 5),
('Carpintero/a ebanista', 5),
('Carpintero/a metálico/a', 5),


-- Psicólogo/a
('Psicología clínica', 69),
('Psicología organizacional', 69),
('Psicología educativa', 69),


-- Fisioterapeuta
('Fisioterapia deportiva', 71),
('Fisioterapia neurológica', 71),


-- Nutricionista
('Nutrición clínica', 70),
('Nutrición deportiva', 70),


-- Conductor/a de transporte escolar
('Transporte de niños', 78),
('Transporte de personas con discapacidad', 78),


-- Bibliotecario/a
('Gestión documental', 82),
('Bibliotecas digitales', 82),


-- Abogado/a
('Derecho penal', 60),
('Derecho civil', 60),
('Derecho laboral', 60),
('Derecho mercantil', 60),
('Derecho ambiental', 60),


-- Notario/a
('Certificación de documentos', 61),
('Escrituras públicas', 61),
('Testamentos', 61),

-- Contador/a
('Contabilidad tributaria', 59),
('Contabilidad financiera', 59),
('Contabilidad de costos', 59),
('Auditoría', 59),
('Contabilidad de empresas', 59),
('Contabilidad gubernamental', 59),
('Contabilidad de ONGs', 59),
('Contabilidad de cooperativas', 59),
('Contabilidad de fundaciones', 59),
('Contabilidad de sindicatos', 59);


----------------------------------------------------------------------------------------------------
-- A continuación se agregan "Sin especialización" para los oficios que aún no tienen especialización:

-- Plomero/a - Gasfitero/a (oficio_id = 6)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 6);

-- Pintor/a (7)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 7);

-- Albañil (8)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 8);

-- Cerrajero/a (9)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 9);

-- Jardinero/a (10)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 10);

-- Técnico/a en refrigeración y aire acondicionado (11)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 11);

-- Técnico/a en electrodomésticos (12)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 12);

-- Mecánico/a de motocicletas (14)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 14);

-- Personal de aseo doméstico (16)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 16);

-- Niñero/a (17)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 17);

-- Cuidado de personas mayores (18)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 18);

-- Cuidador/a de mascotas (19)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 19);

-- Zapatero/a (20)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 20);

-- Sastre/Modista (21)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 21);

-- Armero/a (22)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 22);

-- Panadero/a (23)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 23);

-- Relojero/a (24)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 24);

-- Tejedor/a y artesano/a textil (25)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 25);

-- Escultor/a (26)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 26);

-- Restaurador/a de arte y antigüedades (27)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 27);

-- Ceramista (28)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 28);

-- Ilustrador/a (29)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 29);

-- Peletero/a (30)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 30);

-- Luthier (31)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 31);

-- Calígrafo/a (32)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 32);

-- Rotulista de carteles a mano (33)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 33);

-- Reparador/a de paraguas y bastones (34)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 34);

-- Diseñador/a gráfico/a (36)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 36);

-- Tatuador/a (37)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 37);

-- Barbero/a - Peluquero/a (38)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 38);

-- Cocinero/a - Chef (39)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 39);

-- Agricultor/a (40)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 40);

-- Pescador/a (41)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 41);

-- Curtidor/a de pieles (42)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 42);

-- Vidriero/a (43)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 43);

-- Orfebre (44)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 44);

-- Marmolista (45)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 45);

-- Tapicero/a (46)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 46);

-- Escayolista (47)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 47);

-- Sombrerero/a (48)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 48);

-- Flebotomista (49)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 49);

-- Técnico/a en prótesis dentales (50)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 50);

-- Técnico/a en sonido y grabación (51)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 51);

-- Secretario/a ejecutivo/a (54)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 54);

-- Asistente administrativo/a (55)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 55);

-- Recursos Humanos (56)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 56);

-- Analista financiero/a (57)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 57);

-- Gestor/a de proyectos (58)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 58);

-- Consultor/a empresarial (59)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 59);

-- Especialista en marketing digital (60)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 60);

-- Corredor/a de propiedades (61)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 61);

-- Juez/a (64)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 64);

-- Procurador/a (65)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 65);

-- Asesor/a legal (66)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 66);

-- Terapeuta ocupacional (70)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 70);

-- Entrenador/a personal (71)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 71);

-- Masajista (72)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 72);

-- Homeópata (73)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 73);

-- Tutor/a particular (74)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 74);

-- Intérprete de lenguaje de señas (75)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 75);

-- Coach de vida (76)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 76);

-- Instructor/a de conducción (77)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 77);

-- Chofer particular (78)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 78);

-- Repartidor/a (79)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 79);

-- Mensajero/a (80)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 80);

-- Técnico/a en ascensores (82)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 82);

-- Técnico/a en calefacción (83)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 83);

-- Técnico/a en sistemas de seguridad (84)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 84);

-- Técnico/a en paneles solares (85)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 85);

-- Guía turístico/a (86)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 86);

-- Actor/actriz (88)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 88);

-- Director/a de cine (89)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 89);

-- Coreógrafo/a (90)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 90);

-- Analista de datos (91)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 91);

-- Administrador/a de servidores (92)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 92);

-- Ingeniero/a en redes (93)
INSERT INTO public.especializacion_oficio (nombre, oficio_id) VALUES
('Sin especialización', 93);


-- Sucursales
INSERT INTO sucursal (nombre) VALUES 
('Sucursal Central'),
('Sucursal Norte');

-- Bodegas
INSERT INTO bodega (nombre, id_sucursal) VALUES 
('Bodega Central', 1),
('Bodega Norte', 2);

-- Marcas
INSERT INTO marca (nombre) VALUES 
('Bosch'),
('Stanley'),
('DeWalt');

-- Modelos
INSERT INTO modelo (nombre) VALUES 
('X100'),
('ProMax'),
('Industrial Plus');

-- Categorías
INSERT INTO categoria (nombre) VALUES 
('Taladros'),
('Martillos'),
('Pinturas');

-- Productos
INSERT INTO producto (codigo_producto, nombre, id_marca, id_modelo, id_categoria) VALUES 
('FER-12345', 'Taladro Percutor Bosch', 1, 1, 1),
('FER-54321', 'Martillo Stanley 16oz', 2, 2, 2);

-- Inventario en bodegas
INSERT INTO bodega_producto (id_bodega, id_producto, stock, ultimo_precio) VALUES 
(1, 1, 15, 89090.99),
(2, 1, 10, 90000.00),
(1, 2, 25, 15000.50);

-- Historial de precios
INSERT INTO precio_producto (id_producto, fecha, valor) VALUES 
(1, '2023-05-10T03:00:00.000Z', 89090.99),
(1, '2024-01-01T03:00:00.000Z', 90000.00),
(2, NOW(), 15000.50);

--usuarios 
INSERT INTO usuarios (
  rut, nombre, email, password, telefono, direccion,
  foto_perfil, portada, fecha_registro, razon_social, 
  fecha_creacion_empresa, estado_id, tipo_usuario_id, id_usuario, genero_id
) VALUES (
  '12.345.678-9',                      -- rut
  'Administrador General',              -- nombre
  'admin@ferreteria.com',               -- email
  '$2b$10$LNl8UGlVGOQ8SwZGl8XZtu1Z3wQZQ3C9.Nl4nZf/GBM45wjQ1mJxm', -- password hash ejemplo
  '912345678',                          -- telefono
  'Dirección 123, Santiago',            -- direccion
  NULL,                                 -- foto_perfil
  NULL,                                 -- portada
  NOW(),                                -- fecha_registro
  NULL,                                 -- razon_social
  NULL,                                 -- fecha_creacion_empresa
  1,                                    -- estado_id (activo)
  1,                                    -- tipo_usuario_id (ADMIN)
  uuid_generate_v4(),                   -- id_usuario generado automático
  1                                     -- genero_id (por ejemplo Hombre)
);


INSERT INTO usuarios (
  rut, nombre, email, password, telefono, direccion,
  foto_perfil, portada, fecha_registro, razon_social, 
  fecha_creacion_empresa, estado_id, tipo_usuario_id, id_usuario, genero_id
) VALUES (
  '23.456.789-0',                      -- rut
  'Cliente Prueba',                    -- nombre
  'cliente@ferreteria.com',            -- email
  '$2b$10$TE23BWzv635RNKwVJ.o6AesA0Run2ZP8xX4OycU1ooJjK6qKLLQJK', -- password hash ejemplo
  '987654321',                         -- telefono
  'Otra dirección, Santiago',          -- direccion
  NULL,                                -- foto_perfil
  NULL,                                -- portada
  NOW(),                               -- fecha_registro
  NULL,                                -- razon_social
  NULL,                                -- fecha_creacion_empresa
  1,                                   -- estado_id (activo)
  2,                                   -- tipo_usuario_id (CLIENTE)
  uuid_generate_v4(),                  -- id_usuario generado automático
  2                                    -- genero_id (por ejemplo Mujer)
);


-- Insertar carrito para admin
INSERT INTO carrito_compras (id_usuario, total)
SELECT id_usuario, 0 FROM usuarios WHERE email = 'admin@ferreteria.com';



