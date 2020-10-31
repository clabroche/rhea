const express = require('express');
const router = express.Router();
const fse = require('fs-extra')
const pathfs = require('path')

router.get('/', async function (req, res) {
  const version = await fse.readFile(pathfs.resolve(__dirname, '..', 'version'), 'utf-8')
  res.send(version.trim())
})

module.exports = router