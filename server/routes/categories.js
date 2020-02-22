var express = require('express');
var router = express.Router();
const authentification = require('../middleware/auth')
const Categories = require('../services/Categories')

router.get('/', authentification, async function (req, res, next) {
  const categories = await Categories.all(req.user._id)
  res.json(categories)
})

router.get('/:categoryId', authentification, async function (req, res, next) {
  const category = await Categories.get(req.user._id, req.params.categoryId)
  res.json(category)
})

router.post('/', authentification, async function (req, res, next) {
  const categories = await Categories.create(req.user._id, req.body)
  res.json(categories)
})

router.delete('/:categoryId', authentification, async function (req, res, next) {
  await Categories.delete(req.user._id, req.params.categoryId)
  res.json(true)
})

module.exports = router;
