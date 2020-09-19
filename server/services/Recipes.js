const {mongo} = require('../helpers/mongoConnect')
const ObjectID = require('mongodb').ObjectID
const PromiseB = require('bluebird')
function Recipe(recipe) {
  if(!recipe.ownerId) throw new Error('recipe should be own from a user')
  /** @type {ObjectID | string} */
  this._id = mongo.getID(recipe._id)
  /** @type {string} */
  this.name = recipe.name || ''
  /** @type {number} */
  this.score = recipe.score || 0
  /** @type {number} */
  this.healthy = recipe.healthy || 0
  /** @type {Items} */
  this.items = recipe.items || null
  /** @type {ObjectID[] | string[]} */
  this.itemsId = recipe.itemsId || []
}
Recipe.all = async function (userId) {
  const recipes = await mongo.collection('recipes')
    .find({ ownerId: mongo.getID(userId) })
    .sort({ name: 1 })
    .toArray()
  return recipes.map(recipe => new Recipe(recipe))
}

Recipe.create = async function (ownerId, recipe) {
  if(recipe._id) return this.update(ownerId, recipe)
  const recipeToCreate = {
    name: recipe.name,
    score: recipe.score,
    healthy: recipe.healthy,
    ownerId: mongo.getID(ownerId)
  }
  await mongo.collection('recipes')
    .insertOne(recipeToCreate)
  return recipeToCreate
}
Recipe.update = async function (ownerId, recipe) {
  await mongo.collection('recipes')
    .updateOne({
      _id: mongo.getID(recipe._id),
    }, {
      $set: {
        name: recipe.name,
        score: recipe.score,
        healthy: recipe.healthy,
        ownerId: mongo.getID(ownerId)
      }
    }, { upsert: true }
    )
}
Recipe.delete = async function (ownerId, recipeId) {
  await mongo.collection('recipes')
    .remove({ ownerId: mongo.getID(ownerId), _id: mongo.getID(recipeId) })
}

Recipe.get = async function (ownerId, recipeId) {
  return mongo.collection('recipes')
    .findOne({ ownerId: mongo.getID(ownerId), _id: mongo.getID(recipeId) })
}
Recipe.linkItems = async function (ownerId, recipeId, itemsId) {
  return PromiseB.map(itemsId, async itemId => {
    await mongo.collection('recipes')
      .updateOne(
        { ownerId: mongo.getID(ownerId), _id: mongo.getID(recipeId) },
        { $addToSet: { itemsId: mongo.getID(itemId) } }
      )
    return mongo.collection('items')
      .updateOne(
        { ownerId: mongo.getID(ownerId), _id: mongo.getID(itemId) },
        { $addToSet: { recipesId: mongo.getID(recipeId) } }
      )
  })
}

Recipe.removeLinkItems = async function (ownerId, recipeId, itemId) {
  await mongo.collection('recipes')
    .updateOne(
      { ownerId: mongo.getID(ownerId), _id: mongo.getID(recipeId) },
      { $pull: { itemsId: mongo.getID(itemId) } }
    )
  return mongo.collection('items')
    .updateOne(
      { ownerId: mongo.getID(ownerId), _id: mongo.getID(itemId) },
      { $pull: { recipesId: mongo.getID(recipeId) } }
    )
}


module.exports = Recipe