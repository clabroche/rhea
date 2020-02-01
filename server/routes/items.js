var express = require('express');
var router = express.Router();
const authentification = require('../middleware/auth')
const Items = require('../services/Items')

router.get('/', authentification, async function(req, res, next) {
  const items = await Items.getItems(req.user._id)
  res.json(items)
})
router.get('/:id', authentification, async function(req, res, next) {
  const item = await Items.getItem(req.params.id)
  res.json(item)
})

router.post('/', authentification, async function(req, res, next) {
  const item = await Items.updateOrCreate(req.body, req.user._id)
  res.json(item)
})

router.delete('/:id', authentification, async function(req, res, next) {
  const status = await Items.delete(req.params.id)
  res.json(status)
})

module.exports = router;
