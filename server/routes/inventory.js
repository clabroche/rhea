var express = require('express');
var router = express.Router();
const authentification = require('../middleware/auth')
const Inventory = require('../services/Inventory');
const Item = require('../services/Items');
const { mongo } = require('../helpers/mongoConnect');

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

router.get('/items/barcode/:code', authentification, async function (req, res, next) {
  const code = req.params.code
  const list = await Inventory.getList(req.user._id)
  await list.loadItems()
  const item = await Item.getByBarcode(req.user._id, code)
  if (item) {
    let conf = list.confs.filter(config => config._id.toString() === item._id.toString()).pop()
    if(conf) res.json(conf)
    else {
      conf = { _id: mongo.getID(item._id), total: 0 }
      await list.addConf(conf)
        res.json(Object.assign({}, item, conf))
    }
  }
  res.status(404).send('Product  not found')
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
