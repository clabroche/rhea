const {mongo} = require('../helpers/mongoConnect')
const ObjectID = require('mongodb').ObjectID
const PromiseB = require('bluebird')
const lodash = require('lodash')
const Items = require('./Items')
const Events = require('./Events')
// const Inventory = require('./Inventory')
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
      this.confs.splice(i, 1)
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
List.getListRecommendations = async function (listId, userId) {
  const populars = await Items.getPopular(userId)
  const list = await List.getList(listId)
  const existingItemsIds = list.confs.map(conf => conf._id.toString())
  // const inventory = await Inventory.getList(userId)
  // let inventoryItemsId = inventory.confs.map(conf => conf._id)
  // console.log(inventoryItemsId)
  const filter = item =>  !existingItemsIds.includes(item._id.toString())
  const events = await Events.getWeek(userId)
  let itemsFromRecipes = []
  await PromiseB.map(events, ev => {
    if(ev.recipes) {
      return PromiseB.map(ev.recipes, async recipe => {
        await PromiseB.map(recipe.itemsId, async itemId => {
          itemsFromRecipes.push(await Items.getItem(itemId))
        })
      });
    }
  })
  itemsFromRecipes = itemsFromRecipes
    .filter(v => v && v._id)
    .filter((v, i, a) => a.findIndex(t => (t._id.toString() === v._id.toString())) === i)
  return {
    populars: populars.slice(0, 20).filter(filter),
    recipes: itemsFromRecipes.filter(filter),
  }
}
/** @param {string} listId */
List.increment = async function (listId, itemId, amount) {
  const list = await this.getList(listId)
  const conf = list.confs.filter(config => config._id.toString() === itemId.toString()).pop()
  conf.selected = +amount
  if (conf.selected > conf.total) conf.selected = 0
  await list.update()
  return list
}
List.quantity = async function (listId, itemId, amount) {
  const list = await this.getList(listId)
  const conf = list.confs.filter(config => config._id.toString() === itemId.toString()).pop()
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
  await mongo.collection('items').updateOne({ _id: mongo.getID(conf._id) }, { $inc: { nbAdd: 1}})
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
}
List.prototype.update = async function() {
  const listToUpdate = new List(lodash.cloneDeep(this))
  delete listToUpdate._id
  delete listToUpdate.items
  await mongo.collection('lists')
    .updateOne({_id: this._id}, {$set: listToUpdate})
  return listToUpdate
}
List.deleteItem = async function (listId, itemId) {
  const list = await List.getList(listId)
  list.confs = list.confs.filter(conf => mongo.getID(conf._id).toString() !== mongo.getID(itemId).toString())
  await list.update()
  return list
}
List.delete = async function (listId) {
  await mongo.collection('lists').deleteOne({_id: ObjectID(listId)})
  return listId
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