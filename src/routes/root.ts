const router = require('express').Router();
const root = require('../controllers/root');

router.get('/', root.rootController.index);

module.exports = router;
