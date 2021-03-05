const { mongo } = require("../helpers/mongoConnect")
const PromiseB = require('bluebird')
module.exports = async function setQuantityOnRecipeItems() {
  console.log('execute migration setQuantityOnRecipeItems...')
  const recipes = await mongo.collection('recipes').find({}).toArray()
  await PromiseB.map(recipes, recipe => {
    if (recipe.itemsId && Array.isArray(recipe.itemsId)) {
      recipe.itemsId.map(itemId => {
        if(!recipe.quantities) recipe.quantities = {}
        if (!recipe.quantities[itemId]) recipe.quantities[itemId] = 1
      })
    }
    return mongo.collection('recipes').updateOne({_id: recipe._id}, {$set: recipe})
  }, {concurrency: 8})
}