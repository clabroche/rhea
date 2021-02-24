const {mongo} = require('../helpers/mongoConnect')
const Users = require('./Users')
const Categories = require('./Categories')
const PromiseB = require('bluebird')
const puppeteer = require('puppeteer')
/** @type {import('puppeteer').Browser} */
let browser
;(async () => {
  browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox']
  }).catch(() => {
    return puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    })
  })
})()


function Item(item) {
  if(!item.ownerId) throw new Error('item should be own from a user')
  /** @type {import('mongodb').ObjectID | string} */
  this._id = mongo.getID(item._id)
  /** @type {string} */
  this.name = item.name || ''
  /** @type {string} */
  this.description = item.description || ''
  /** @type {number} */
  this.price = item.price || 0
  /** @type {number} */
  this.barcode = Number.isNaN(+item.barcode) ? 0 : +item.barcode
  /** @type {import('mongodb').ObjectID[] | string[]} */
  this.categoriesId = item.categoriesId || []
  /** @type {import('mongodb').ObjectID | string} */
  this.ownerId = mongo.getID(item.ownerId) || ''
  /** @type {User} */
  this.owner = item.owner || null
  /** @type {String[]} */
  this.images = item.images || []
  /** @type {String} */
  this.image = item.image || ''
}
Item.prototype.getUser = async function() {
  this.owner = await Users.getUser(this.ownerId)
}
Item.getItems = async function (userId) {
  const items = await mongo.collection('items')
    .find({ ownerId: mongo.getID(userId) })
    .sort({ name: 1 })
    .toArray()
  return items.map(item => new Item(item))
}
Item.getPopular = async function (userId) {
  const items = await mongo.collection('items')
    .find({ ownerId: mongo.getID(userId) })
    .sort({ nbAdd: -1 })
    .toArray()
  return items.map(item => new Item(item))
}
Item.getHistory = async function (userId) {
  const items = await mongo.collection('items')
    .find({ ownerId: mongo.getID(userId) })
    .sort({ _id: -1 })
    .toArray()
  return items.map(item => new Item(item))
}
Item.prototype.fetchByName = async function () {
  if(!this._id) {
    const item = await mongo.collection('items')
      .findOne({ name: this.name })
    if(item) this._id = item._id
  }
  return this
}
Item.prototype.enrichAll = async function() {
  console.log('Enrich images')
  const count = await mongo.collection('items').find().count()
  const items = await mongo.collection('items').find().toArray()
  let i = 0
  await PromiseB.map(items, async _item => {
    i++
    console.log(`sync: ${i}/${count}`)
    await Item.updateOrCreate(_item, _item.ownerId)
      .catch(console.error)
    }, {concurrency: 9})
    console.log('End')
}
/** Enrich item with api */
Item.prototype.enrich = async function (force = false) {
  if(force || !this.images.length) {
    const url = `https://www.qwant.com/?q=${this.name}&t=images` 
    const page = await browser.newPage()
    try {
      await page.goto(url)
      await page.waitForSelector('.result__link', {timeout: 5000})
      const $images = await page.$$('.result__link')
      this.images = await PromiseB.map($images.slice(0, 10), async $image => {
        const link = await $image.getProperty('href')
        if(!link) return
        return await link.jsonValue()
      }).filter(a => a)
      console.log(this.images)
      if(!this.image) {
        this.image = this.images[0]
      }
    } finally {
      await page.close()
    }
  }
}
Item.search = async function (userId, search) {
  const items = await mongo.collection('items')
    .find({ ownerId: mongo.getID(userId), name: new RegExp(`${search}`, 'gi') })
    .sort({ name: 1 })
    .toArray()
  return items.map(item => new Item(item))
}
Item.getByBarcode = async function (userId, barcode) {
  const item = await mongo.collection('items')
    .findOne({ ownerId: mongo.getID(userId), barcode: +barcode})
  return item ? new Item(item) : null
}
Item.updateOrCreate = async function(itemToCreate, userId, forceEnrich) {
  itemToCreate.ownerId = mongo.getID(userId)
  const item = new Item(itemToCreate)
  await item.fetchByName()
  await item.enrich(forceEnrich).catch(console.error)
  delete item.owner
  if(item._id) 
    await mongo
      .collection('items')
      .updateOne({_id: mongo.getID(item._id)}, {$set: item})  
  else await mongo
      .collection('items')
      .insertOne(item)
  return item
}
Item.getItem = async function(id) {
  const item = await mongo
    .collection('items')
    .findOne({_id: mongo.getID(id)})
  return item ? new Item(item) : null
}
Item.delete = async function(id) {
  const item = await mongo.collection('items').findOne({_id: mongo.getID(id)})
  if(item.categoriesId) {
    await PromiseB.map(item.categoriesId, categoryId => {
      return Categories.removeLinkItems(item.ownerId, categoryId, item._id)
    })
  }
  await mongo
    .collection('items')
    .deleteOne({_id: mongo.getID(id)})
  return item
}
module.exports = Item