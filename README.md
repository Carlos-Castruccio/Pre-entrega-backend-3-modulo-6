# ShipNow — Pre-entrega Módulo 5 Backend III

API del proyecto anterior ampliada con documentación OpenAPI 3.0.3 y Swagger UI. Conserva usuarios, productos, mocks, Winston y manejo centralizado de errores. Incorpora rutas persistentes de pedidos y entregas para cubrir los módulos de la consigna.

## Instalación y ejecución

Requisitos: Node.js >= 20.19, npm y MongoDB local o Atlas.

```sh
npm ci
```

Copiar `.env.example` a `.env` y completar:

```dotenv
PORT=8080
MONGODB_URI=mongodb://127.0.0.1:27017/shipnow_modulo5
NODE_ENV=development
```

En PowerShell: `Copy-Item .env.example .env`. Si ya existe un `.env`, conservarlo y revisar sus valores. Usar una base de prueba: seed inserta datos reales.

```sh
npm start
# Durante desarrollo:
npm run dev
```

El arranque requiere conexión a MongoDB. Abre el servidor solo después de conectar y crear los índices únicos de usuarios y entregas.

## Swagger

- Interfaz interactiva: http://localhost:8080/api/docs/
- Especificación JSON: http://localhost:8080/api/docs/openapi.json
- Si cambiás PORT, usá ese puerto en las URLs. El servidor seleccionado por defecto en Swagger usa el mismo origen.

Swagger UI se sirve desde la dependencia instalada, sin depender de un CDN al abrir la página. Abrí un módulo, seleccioná una operación, pulsá **Try it out**, completá los campos y **Execute**. La API no implementa autenticación: no requiere token ni documenta respuestas 401/403.

La configuración está en `src/config/swagger.config.js`; la especificación, separada de la lógica de rutas, en `src/docs/openapi.json`. Define schemas reutilizables User, Product, Order, OrderItem, Delivery, SuccessResponse, ErrorResponse, entradas, estados y respuestas mock.

## Módulos documentados

| Tag | Operaciones |
| --- | --- |
| Users | GET/POST `/api/users`; GET/PUT/DELETE `/api/users/{uid}` |
| Products | GET/POST `/api/products`; GET/PUT/DELETE `/api/products/{pid}` |
| Orders | GET/POST `/api/orders`; GET `/api/orders/{oid}`; PATCH `/api/orders/{oid}/status` |
| Deliveries | GET/POST `/api/deliveries`; GET `/api/deliveries/{did}`; PATCH `/api/deliveries/{did}/status` |
| Mocks | GET `/api/mocks/users`, `/drivers`, `/orders`, `/deliveries`, `/lote`; POST `/api/mocks/seed` |
| Logger | GET `/api/loggerTest` |
| Health | GET `/health` |

Los PUT de usuarios y productos admiten actualización parcial con al menos un campo permitido. Los IDs son ObjectId de 24 caracteres hexadecimales. El alta pública de usuarios asigna USER; role no es un campo modificable por esta API. Las contraseñas se guardan como hash y no se devuelven. El estado de productos depende del stock.

Pedidos requieren user, address y description. priority admite LOW, NORMAL o HIGH (NORMAL por defecto). items es opcional y contiene objetos con name y quantity entera positiva. Este campo se incorpora de forma compatible con los pedidos del módulo anterior, que no tenían items.

Entregas requieren order existente; solo puede haber una por pedido. driver es opcional o null; si se envía debe referenciar un usuario con rol DELIVERY_DRIVER. El estado inicial de ambos recursos es PENDING. PATCH admite cualquier estado enumerado, sin secuencia obligatoria ni sincronización automática entre pedido y entrega.

- Pedidos: PENDING, IN_TRANSIT, DELIVERED, CANCELLED.
- Entregas: PENDING, ASSIGNED, DELIVERED, CANCELLED.

## Recorrido de prueba

1. Crear un usuario con POST `/api/users`: `{"firstName":"Ana","lastName":"Pérez","email":"ana@example.com","password":"Clave12345"}`. Copiar `payload._id`.
2. Crear un pedido con POST `/api/orders`, reemplazando USER_ID: `{"user":"USER_ID","address":"Av. Siempre Viva 123","description":"Entrega de libros","items":[{"name":"Libro","quantity":2}]}`.
3. Copiar el ID del pedido y crear una entrega con POST `/api/deliveries`: `{"order":"ORDER_ID"}`.
4. Consultar los listados y cambiar un estado con PATCH, usando `{"status":"DELIVERED"}`.
5. Probar un estado como `UNKNOWN`: devuelve 400 y el código de estado inválido del módulo. Probar un ID bien formado que no exista: devuelve 404.

Los IDs de los ejemplos en Swagger son ilustrativos: reemplazarlos por IDs de tu base. Para obtener repartidores persistidos, ejecutar seed con collection=all y usar un usuario con role DELIVERY_DRIVER.

## Mocks y carga de datos

Los GET generan datos sin escribir en MongoDB y devuelven JSON directo, sin status/payload. Cada llamada genera IDs nuevos: sus referencias no son registros persistidos. Para comprobar relaciones usar una sola respuesta de lote.

`qty` va en la URL, vale 10 por defecto y acepta enteros de 1 a 100, sin ceros iniciales ni valores repetidos. Se rechazan parámetros desconocidos.

```sh
curl "http://localhost:8080/api/mocks/orders?qty=2"
curl "http://localhost:8080/api/mocks/lote?qty=2"
curl -X POST "http://localhost:8080/api/mocks/seed?qty=2&collection=all"
```

En PowerShell usar `curl.exe`. Seed se invoca **sin body**; también acepta `{}`. Un body con campos como `{"qty":2}` devuelve 400 INVALID_INPUT: qty y collection se envían en la URL, conservando el contrato del módulo anterior.

- `collection=users` (predeterminado) inserta qty usuarios y devuelve 201 con `{"insertados":2,"coleccion":"usuarios"}` para qty=2.
- `collection=all` inserta qty clientes, qty repartidores, qty pedidos y qty entregas. Devuelve 201 con insertados, colecciones y datos, sin contraseñas. Para qty=2 son 8 registros.
- Los previews users/drivers generan qty usuarios; orders genera qty clientes y qty pedidos. deliveries/lote generan qty clientes, qty repartidores, qty pedidos y qty entregas.
- Repetir seed agrega nuevos datos. La carga intenta compensar inserciones parciales; no constituye una transacción MongoDB.

## Respuestas y errores

CRUD devuelve `{"status":"success","payload":...}`; mocks, logger y health conservan su propio formato, especificado en Swagger. Los errores centralizados son `{"status":"error","error":{"code":"...","message":"..."}}`.

| HTTP | Casos |
| --- | --- |
| 400 | INVALID_INPUT, INVALID_JSON, INVALID_STATUS (productos), INVALID_ORDER_STATUS, INVALID_DELIVERY_STATUS, INVALID_MOCK_QUANTITY, INVALID_MOCK_COLLECTION |
| 404 | USER_NOT_FOUND, PRODUCT_NOT_FOUND, ORDER_NOT_FOUND, DELIVERY_NOT_FOUND, ROUTE_NOT_FOUND |
| 409 | DUPLICATE_RESOURCE: email duplicado o entrega repetida para un pedido |
| 413 | PAYLOAD_TOO_LARGE: cuerpo superior al límite JSON de 100 KB |
| 500 | INTERNAL_ERROR; MOCK_GENERATION_FAILED durante la generación de seed |
| 503 | MOCK_LOAD_FAILED al fallar la persistencia de seed |

Swagger documenta los errores aplicables a cada operación. Un fallo de conexión en consultas normales se normaliza a 500; en la carga seed se informa 503. Health comprueba que HTTP responde, no la salud de MongoDB.

## Logger

GET `/api/loggerTest` es una herramienta técnica de validación, no una función de negocio. Emite debug, http, info, warning, error y fatal. En desarrollo se muestran todos; en producción se muestran info y niveles de mayor gravedad. Solo error y fatal se guardan en `logs/error.log`, con rotación. Es esperable que esta prueba genere mensajes de error y fatal.

## Verificación

```sh
npm test
```

La suite funcional del módulo 6 usa Mocha, Chai, Supertest y MongoDB temporal real. No necesita iniciar el servidor ni configurar Atlas. Los tests anteriores con dobles de modelos se conservan y se ejecutan mediante npm run test:legacy. Ver la sección Testing funcional Módulo 6 al final.

## Estructura

- `src/config`: entorno, logger y montaje de Swagger.
- `src/docs/openapi.json`: contrato de todas las operaciones.
- `src/routes`, `controllers`, `services`, `repositories`, `models`: arquitectura existente; las nuevas rutas de envío delegan en shipping.service y reutilizan modelos y validadores.
- `src/errors` y `src/middlewares`: diccionario y manejo centralizado de errores.
- `test`: pruebas automatizadas.
- `docs/modulo-4.md`: documentación anterior conservada como referencia histórica.

## Entrega en GitHub

Entregar el enlace al repositorio con estos cambios. Incluir package-lock.json; excluir node_modules, .env y logs mediante .gitignore. No publicar credenciales. Este entregable no crea commits ni publica cambios automáticamente.

## Testing funcional Módulo 6

Herramientas: Mocha, Chai, Supertest y mongodb-memory-server. Ejecutar npm ci y npm test (dos veces para comprobar repetibilidad). Cubre usuarios, pedidos, entregas, mocks, logger, Swagger y errores. No requiere una base externa: inicia MongoDB temporal, limpia antes de cada caso y lo cierra al terminar. Variables en .env.test: NODE_ENV=test, PORT=8081, TEST_DB_NAME=shipnow_test; MONGODB_URI se genera automáticamente. Primera ejecución: requiere descargar el binario de MongoDB. Ver [guía y evaluación de la base](docs/modulo-6.md).


