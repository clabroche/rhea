var express = require('express');
var router = express.Router();

router.use('/items', require('./items'))
router.use('/lists', require('./lists'))
router.use('/inventory', require('./inventory'))
router.use('/categories', require('./categories'))
router.use('/recipes', require('./recipes'))
router.use('/events', require('./events'))
router.use('/version', require('./version'))
router.use('/images', require('./images'))

module.exports = router;
