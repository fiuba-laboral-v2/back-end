var router = require('express').Router();
import { Express } from 'express'
var root = require('../controllers/root');

module.exports = class IndexRoute {
  constructor(app: Express) {
    router.get('/', root.rootController.index);
    app.use('/', router)
  }
}
