var express = require('express');
var router = express.Router();
const authentification = require('../middleware/auth')
const Inventory = require('../services/Inventory')

router.get('/', authentification, async function (req, res, next) {
  const list = await Inventory.getList(req.user._id)
  await list.loadItems()
  res.json(list)
})
router.get('/items', authentification, async function (req, res, next) {
  const list = await Inventory.getList(req.user._id)
  await list.loadItems()
  res.json(list.items || [])
})
router.put('/items/:itemId/total', authentification, async function (req, res, next) {
  console.log(req.body)
  const list = await Inventory.updateTotal(req.user._id, req.params.itemId, req.body.total)
  res.json(list)
})

router.post('/', authentification, async function(req, res, next) {
  const list = await Inventory.createList(req.user._id)
  res.json(list)
})

router.post('/items', authentification, async function(req, res, next) {
  const list = await Inventory.getList(req.user._id)
  await list.addConf(req.body)
  res.json(list)
})
router.delete('/items/:itemId', authentification, async function (req, res, next) {
  const list = await Inventory.deleteItem(req.params.itemId)
  res.json(list)
})

router.put('/items/:itemId/quantity/:amount', authentification, async function (req, res, next) {
  const { itemId, amount } = req.params
  await Inventory.quantity(itemId, amount)
  res.json(true)
})

module.exports = router;
