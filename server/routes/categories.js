var express = require('express');
var router = express.Router();
const authentification = require('../middleware/auth')
const Categories = require('../services/Categories')

router.get('/', authentification, async function(req, res, next) {
  const categories = await Categories.all(req.user._id)
  res.json(categories)
})

module.exports = router;
