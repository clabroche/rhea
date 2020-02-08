var express = require('express');
var router = express.Router();
const authentification = require('../middleware/auth')
const Lists = require('../services/Lists')

router.get('/', authentification, async function(req, res, next) {
  const lists = await Lists.getListsFromUser(req.user._id)
  res.json(lists)
})

router.post('/', authentification, async function(req, res, next) {
  const list = await Lists.createList(req.body, req.user._id)
  res.json(list)
})

router.get('/:listId', authentification, async function(req, res, next) {
  const list = await Lists.getList(req.params.listId)
  await list.loadItems()
  res.json(list)
})
router.post('/:listId/addItem', authentification, async function(req, res, next) {
  const list = await Lists.getList(req.params.listId)
  await list.addConf(req.body)
  res.json(list)
})
router.delete('/:listId/items/:itemId', authentification, async function (req, res, next) {
  const list = await Lists.deleteItem(req.params.listId, req.params.itemId)
  res.json(list)
})
router.delete('/:listId', authentification, async function (req, res, next) {
  const list = await Lists.delete(req.params.listId)
  res.json(list)
})
router.put('/:listId/items/:itemId/increment/:amount', authentification, async function (req, res, next) {
  const { listId, itemId, amount } = req.params
  await Lists.increment(listId, itemId, amount)
  res.json(true)
})

router.put('/:listId/items/:itemId/quantity/:amount', authentification, async function (req, res, next) {
  const { listId, itemId, amount } = req.params
  await Lists.quantity(listId, itemId, amount)
  res.json(true)
})

router.put('/:listId', authentification, async function(req, res, next) {
  const listToUpdate = new Lists(req.body)
  await listToUpdate.update()
  res.json(listToUpdate)
})


module.exports = router;
