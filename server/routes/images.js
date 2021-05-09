const { default: axios } = require('axios');
const express = require('express');
const sharp = require('sharp');
const router = express.Router();

router.get('/', async(req, res) => {
  const url = req.query.url
  axios.get(url.toString(), {responseType: 'arraybuffer'})
    .then(async({data})=> {
      const headers = {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment;filename="${url}"` // Needed to enforce correct filename in Chrome.)
      }
      const image = await sharp(Buffer.from(data, 'binary'))
        .resize(200)
        .toBuffer()

      res.writeHead(200, headers)
      res.end(image)
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send()
    })
})

module.exports = router