var express = require('express');
const ioConnect = require('../helpers/ioConnect');
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
  ioConnect.notifyUsers(req.user, 'category:update')
  res.json(categories)
})

router.post('/:categoryId/link-items', authentification, async function (req, res, next) {
  await Categories.linkItems(req.user._id, req.params.categoryId, req.body)
  ioConnect.notifyUsers(req.user, 'category:item:add')
  res.json(true)
})

router.delete('/:categoryId/link-items/:itemId', authentification, async function (req, res, next) {
  await Categories.removeLinkItems(req.user._id, req.params.categoryId, req.params.itemId)
  ioConnect.notifyUsers(req.user, 'category:item:delete')
  res.json(true)
})

router.delete('/:categoryId', authentification, async function (req, res, next) {
  await Categories.delete(req.user._id, req.params.categoryId)
  ioConnect.notifyUsers(req.user, 'category:delete')
  res.json(true)
})

module.exports = router;
