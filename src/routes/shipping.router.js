import { Router } from 'express';
import * as service from '../services/shipping.service.js';
export function shippingRouter(type, param) {
  const router = Router();
  const respond = (status, action) => async (req, res, next) => {
    try { res.status(status).json({ status: 'success', payload: await action(req) }); }
    catch (error) { next(error); }
  };
  router.get('/', respond(200, () => service.getAll(type)));
  router.get('/:' + param, respond(200, req => service.getById(type, req.params[param])));
  router.post('/', respond(201, req => service.create(type, req.body)));
  router.patch('/:' + param + '/status', respond(200, req => service.updateStatus(type, req.params[param], req.body)));
  return router;
}
