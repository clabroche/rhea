var express = require('express');
var router = express.Router();

router.use('/items', require('./items'))
router.use('/lists', require('./lists'))

module.exports = router;
