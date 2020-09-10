var express = require('express');
var router = express.Router();
const authentification = require('../middleware/auth')
const Events = require('../services/Events')

router.get('/', authentification, async function (req, res, next) {
  const events = await Events.all(req.user._id)
  res.json(events)
})

router.get('/:eventId', authentification, async function (req, res, next) {
  const event = await Events.get(req.user._id, req.params.eventId)
  res.json(event)
})

router.post('/', authentification, async function (req, res, next) {
  const events = await Events.create(req.user._id, req.body)
  res.json(events)
})

router.delete('/:eventId', authentification, async function (req, res, next) {
  await Events.delete(req.user._id, req.params.eventId)
  res.json(true)
})

module.exports = router;
