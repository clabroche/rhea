const {mongo} = require('../helpers/mongoConnect')
const Recipes = require('./Recipes')
function Event(event) {
  if(!event.ownerId) throw new Error('event should be own from a user')
  /** @type {import('mongodb').ObjectID | string} */
  this._id = mongo.getID(event._id)
  /** @type {string} */
  this.title = event.title || ''
  /** @type {string} */
  this.start = event.start || ''
  /** @type {string} */
  this.end = event.end || ''
  /** @type {string} */
  this.content = event.content || ''
  /** @type {string} */
  this.class = event.class || ''
  /** @type {import('mongodb').ObjectID | string} */
  this.recipeId = mongo.getID(event.recipeId)
  /** @type {Recipes[]} */
  this.recipes = event.recipes ? event.recipes.map(recipe => new Recipes(recipe)) : []
  if (this.recipes && this.recipes.length) {
    this.title = event.recipes[0].name || ""
  }
}
Event.all = async function (userId) {
  const events = await mongo.collection('events')
    .aggregate()
    .match({ ownerId: mongo.getID(userId) })
    .lookup({
      from: 'recipes',
       localField: 'recipeId',
       foreignField: '_id',
       as: 'recipes'
    })
    .sort({ name: 1 })
    .toArray()
  return events.map(event => new Event(event))
}

Event.create = async function (ownerId, event) {
  if(event._id) return this.update(ownerId, event)
  const existingEvent = await mongo.collection('events').findOne({ownerId, start: event.start})
  if (existingEvent) await Event.delete(ownerId, existingEvent._id)
  await mongo.collection('events')
  .insertOne({
      title: event.title,
      recipeId: mongo.getID(event.recipeId),
      start: event.start,
      end: event.end,
      content: event.content,
      class: event.class,
      ownerId: mongo.getID(ownerId)
    })
}
Event.update = async function (ownerId, event) {
  await mongo.collection('events')
    .updateOne({
      _id: mongo.getID(event._id),
    }, {
      $set: {
        title: event.title,
        recipeId: mongo.getID(event.recipeId),
        start: event.start,
        end: event.end,
        content: event.content,
        class: event.class,
        ownerId: mongo.getID(ownerId)
      }
    }, { upsert: true }
    )
}
Event.delete = async function (ownerId, eventId) {
  await mongo.collection('events')
    .remove({ ownerId: mongo.getID(ownerId), _id: mongo.getID(eventId) })
}

Event.get = async function (ownerId, eventId) {
  const events = await mongo.collection('events')
    .aggregate()
    .match({ ownerId: mongo.getID(ownerId), _id: mongo.getID(eventId) })
    .lookup({
      from: 'recipes',
      localField: 'recipeId',
      foreignField: '_id',
      as: 'recipes'
    })
  return events[0]
}

module.exports = Event