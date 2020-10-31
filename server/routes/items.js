var express = require('express');
var router = express.Router();
const authentification = require('../middleware/auth')
const Items = require('../services/Items')
const axios = require('axios').default
const cheerio = require('cheerio');
const ioConnect = require('../helpers/ioConnect');

router.get('/', authentification, async function (req, res, next) {
  const items = await Items.getItems(req.user._id)
  res.json(items)
})
router.post('/barcode/:code', authentification, async function (req, res, next) {
  const code = req.params.code
  const { data: response } = await axios.get(`https://world.openfoodfacts.org/api/v0/product//${code}.json`)
  if (response.status === 1) {
    const product = response.product
    const related = await Items.search(req.user._id, product.product_name)
    ioConnect.notifyUsers(req.user, 'item:update', product)
    return res.json({ product, related })
  } else {
    const product = {}
    const { data: page } = await axios.get('https://www.ecosia.org/images?q=3059943019621 france')
    const $page = cheerio.load(page)
    const $item = $page('.image-preview-media img')[0].attribs
    product.image_url = $item['data-src']
    product.product_name= $item['alt']
    const related = await Items.search(req.user._id, product.product_name)
    ioConnect.notifyUsers(req.user, 'item:update', product)
    return res.json({ product, related })
  }
})
router.get('/barcode/:code', authentification, async function (req, res, next) {
  const code = req.params.code
  const item = await Items.getByBarcode(req.user._id, code)
  if(item) return res.json(item)
  res.status(404).send('Product  not found')
})
router.get('/:id', authentification, async function(req, res, next) {
  const item = await Items.getItem(req.params.id)
  res.json(item)
})

router.post('/', authentification, async function(req, res, next) {
  const item = await Items.updateOrCreate(req.body, req.user._id)
  ioConnect.notifyUsers(req.user, 'item:update', item)
  res.json(item)
})

router.delete('/:id', authentification, async function(req, res, next) {
  const status = await Items.delete(req.params.id)
  ioConnect.notifyUsers(req.user, 'item:delete')
  res.json(status)
})

module.exports = router;
