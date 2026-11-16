export const ERROR_DICTIONARY = Object.freeze({
  ORDER_NOT_FOUND: { statusCode: 404, message: 'Pedido no encontrado' },
  DELIVERY_NOT_FOUND: { statusCode: 404, message: 'Entrega no encontrada' },
  INVALID_ORDER_STATUS: { statusCode: 400, message: 'Estado de pedido inválido' },
  INVALID_DELIVERY_STATUS: { statusCode: 400, message: 'Estado de entrega inválido' },
  INVALID_INPUT: { statusCode: 400, message: 'Los datos enviados no son válidos' },
  USER_NOT_FOUND: { statusCode: 404, message: 'Usuario no encontrado' },
  PRODUCT_NOT_FOUND: { statusCode: 404, message: 'Producto no encontrado' },
  INVALID_STATUS: { statusCode: 400, message: 'Estado de producto inválido' },
  INVALID_MOCK_QUANTITY: { statusCode: 400, message: 'qty debe ser un entero entre 1 y 100' },
  INVALID_MOCK_COLLECTION: { statusCode: 400, message: 'collection debe ser users o all' },
  MOCK_GENERATION_FAILED: { statusCode: 500, message: 'No se pudieron generar los mocks' },
  MOCK_LOAD_FAILED: { statusCode: 503, message: 'No se pudieron cargar los mocks en MongoDB' },
  DUPLICATE_RESOURCE: { statusCode: 409, message: 'Ya existe un registro con esos datos únicos' },
  INVALID_JSON: { statusCode: 400, message: 'El JSON enviado no es válido' },
  PAYLOAD_TOO_LARGE: { statusCode: 413, message: 'El cuerpo de la solicitud es demasiado grande' },
  ROUTE_NOT_FOUND: { statusCode: 404, message: 'Ruta no encontrada' },
  INTERNAL_ERROR: { statusCode: 500, message: 'Error interno del servidor' }
});
