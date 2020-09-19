const express = require('express');
const router = express.Router();
const fse = require('fs-extra')
const pathfs = require('path')

router.get('/', async function (req, res) {
  const version = await fse.readFile(pathfs.resolve(__dirname, '..', 'version'))
  console.log(version)
  res.send(version)
})

module.exports = router