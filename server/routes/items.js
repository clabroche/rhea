var express = require('express');
var router = express.Router();
const authentification = require('../middleware/auth')
const Items = require('../services/Items')
const axios = require('axios').default
const cheerio = require('cheerio');

router.get('/', authentification, async function (req, res, next) {
  const items = await Items.getItems(req.user._id)
  res.json(items)
})
router.post('/barcode/:code', authentification, async function (req, res, next) {
  const code = req.params.code
  const { data: response } = await axios.get(`https://world.openfoodfacts.org/api/v0/product//${code}.json`)
  if(response.status === 1) {
    const product = response.product
    const related = Items.search(req.user._id, product.product_name)
    res.json({product, related})
  }
  res.status(404).send('Product  not found')
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
