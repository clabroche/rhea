const {mongo} = require('../helpers/mongoConnect')
const ObjectID = require('mongodb').ObjectID
const PromiseB = require('bluebird')
const lodash = require('lodash')
const Items = require('./Items')
/**
 * 
 * @param {List} list 
 */
function List(list) {
  /** @type {ObjectID | string} */
  this._id = mongo.getID(list._id)
  /** @type {string} */
  this.name = list.name || ''
  /** @type {string} */
  this.description = list.description || ''
  /** @type {ObjectID | string} */
  this.ownerId = mongo.getID(list.ownerId) || ''
  /** @type {User} */
  this.owner = list.owner || ''
  /** @type {ItemList[]} */
  this.items = list.items || []
  /** @type {Conf[]} */
  this.confs = list.confs || []
}
List.prototype.loadItems = async function() {
  this.items = await PromiseB.map(this.confs, async (itemConf, i) => {
    const item = await Items.getItem(itemConf._id)
    if(!item) { // If item doesn't exist, remove it from array
      this.conf.splice(i, 1)
      return 
    }
    return Object.assign(item, itemConf) // Merge itemconf with real item
  }).filter(a => a) // Remove undefined items
}
/** @param {string} listId */
List.getList = async function (listId) {
  const list = await mongo
    .collection('lists')
    .findOne({ _id: mongo.getID(listId) })
  list.confs = await PromiseB.map(list.confs, async conf => {
    const item = await mongo.collection('items').findOne({ _id: mongo.getID(conf._id) })
    return Object.assign(conf, item)
  })
  return new List(list)
}
/** @param {string} listId */
List.increment = async function (listId, itemId, amount) {
  const list = await this.getList(listId)
  const conf = list.confs.filter(conf => conf._id.toString() === itemId.toString()).pop()
  conf.selected = +amount
  if (conf.selected > conf.total) conf.selected = 0
  await list.update()
  return list
}
List.quantity = async function (listId, itemId, amount) {
  const list = await this.getList(listId)
  const conf = list.confs.filter(conf => conf._id.toString() === itemId.toString()).pop()
  conf.total = +amount
  if(conf.total < conf.selected) conf.selected = conf.total
  await list.update()
  return list
}
/** @param {string} userId */
List.getListsFromUser = async function(userId) {
  const lists = await mongo
    .collection('lists')
    .find({ownerId: userId})
    .toArray()
  return lists.map(list => new List(list))
}
/** @param {Conf} conf*/
List.prototype.addConf = async function(conf) {
  conf._id = mongo.getID(conf._id)
  this.confs.push(conf)
  this.removeConfDuplicata()
  await this.update()
}
/** 
 * @param {List} listToCreate
 * @param {string} userId
 */
List.createList = async function(listToCreate, userId) {
  listToCreate.ownerId = userId
  listToCreate = new List(listToCreate)
  delete listToCreate.items
  await mongo
    .collection('lists')
    .insertOne(listToCreate)
  return listToCreate
}
List.prototype.removeConfDuplicata = function() {
  this.confs = lodash.uniqBy(this.confs, item => mongo.getID(item._id).toString())
}
List.prototype.revertConfFromItems = function() {
  if(this.items.length) {
    this.confs = this.items.map(item => ({
      _id: mongo.getID(item._id),
      selected: item.selected,
      total: item.total
    }))
  }
  console.log(this)
}
List.prototype.update = async function() {
  const listToUpdate = new List(lodash.cloneDeep(this))
  delete listToUpdate._id
  delete listToUpdate.items
  await mongo.collection('lists')
    .updateOne({_id: this._id}, {$set: listToUpdate})
  return listToUpdate
}
List.deleteItem = async function(listId, itemId) {
  const list = await List.getList(listId)
  list.confs = list.confs.filter(conf => mongo.getID(conf._id).toString() !== mongo.getID(itemId).toString())
  await list.update()
  return list
}

module.exports = List



/**
 * @typedef Conf
 * @property {ObjectID | string} _id id of item
 * @property {number} selected number of selection 
 * @property {number} total total we can select the item 
 */
 /**
  * @typedef {import('./Items').Item & Conf} ItemList
 */