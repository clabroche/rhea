const {mongo} = require('../helpers/mongoConnect')
const ObjectID = require('mongodb').ObjectID
const PromiseB = require('bluebird')
const lodash = require('lodash')
const Items = require('./Items')
const sort = require('fast-sort')
/**
 * 
 * @param {Inventory} list 
 */
function Inventory(list) {
  /** @type {ObjectID | string} */
  this._id = mongo.getID(list._id)
  /** @type {ObjectID | string} */
  this.ownerId = mongo.getID(list.ownerId) || ''
  /** @type {User} */
  this.owner = list.owner || ''
  /** @type {ItemList[]} */
  this.items = list.items || []
  /** @type {Conf[]} */
  this.confs = list.confs || []
}
Inventory.prototype.loadItems = async function() {
  this.items = await PromiseB.map(this.confs, async (itemConf, i) => {
    const item = await Items.getItem(itemConf._id)
    if(!item) { // If item doesn't exist, remove it from array
      this.confs.splice(i, 1)
      return 
    }
    return Object.assign(item, itemConf) // Merge itemconf with real item
  }).filter(a => a) // Remove undefined items
}
/** @param {string} listId */
Inventory.getList = async function (ownerId) {
  let list = await mongo
    .collection('inventory')
    .findOne({ ownerId: mongo.getID(ownerId) })
  if(!list) list = await this.createList(ownerId)
  list.confs = await PromiseB.map(list.confs, async conf => {
    const item = await mongo.collection('items').findOne({ _id: mongo.getID(conf._id) })
    return Object.assign(conf, item)
  })
  list.confs = sort(list.confs).asc(items => items.name)
  return new Inventory(list)
}
Inventory.updateTotal = async function (ownerId, itemId, amount) {
  let list = await this.getList(ownerId)
  const conf = list.confs.filter(config => config._id.toString() === itemId.toString()).pop()
  conf.total = amount
  if(conf.total <= 0) {
    list = await this.deleteItem(ownerId, conf._id)
  } else {
    await list.update()
  }
  return list
}
/** @param {Conf} conf*/
Inventory.prototype.addConf = async function(conf) {
  conf._id = mongo.getID(conf._id)
  this.confs.push(conf)
  this.removeConfDuplicata()
  await this.update()
}
/** 
 * @param {Inventory} listToCreate
 * @param {string} userId
 */
Inventory.createList = async function (ownerId) {
  const inventory = new Inventory({ ownerId: mongo.getID(ownerId) })
  delete inventory.items
  await mongo
    .collection('inventory')
    .insertOne(inventory)
  return inventory
}
Inventory.prototype.removeConfDuplicata = function() {
  this.confs = lodash.uniqBy(this.confs, item => mongo.getID(item._id).toString())
}
Inventory.prototype.revertConfFromItems = function() {
  if(this.items.length) {
    this.confs = this.items.map(item => ({
      _id: mongo.getID(item._id),
      selected: item.selected,
      total: item.total
    }))
  }
}
Inventory.prototype.update = async function() {
  const listToUpdate = new Inventory(lodash.cloneDeep(this))
  delete listToUpdate._id
  delete listToUpdate.items
  await mongo.collection('inventory')
    .updateOne({_id: this._id}, {$set: listToUpdate})
  return listToUpdate
}
Inventory.deleteItem = async function (ownerId, itemId) {
  const list = await Inventory.getList(ownerId)
  list.confs = list.confs.filter(conf => mongo.getID(conf._id).toString() !== mongo.getID(itemId).toString())
  await list.update()
  return list
}
Inventory.delete = async function (listId) {
  await mongo.collection('inventory').deleteOne({_id: ObjectID(listId)})
  return listId
}

module.exports = Inventory



/**
 * @typedef Conf
 * @property {ObjectID | string} _id id of item
 * @property {number} selected number of selection 
 * @property {number} total total we can select the item 
 */
 /**
  * @typedef {import('./Items').Item & Conf} ItemList
 */