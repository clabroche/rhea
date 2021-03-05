import API from './API'
import Auth from './Auth'
/**
 * 
 * @param {Recipe} recipe 
 */
// @ts-ignore
// eslint-disable-next-line no-unused-vars
function Recipe(recipe = {}) {
  this._id = recipe._id || null
  this.name = recipe.name || ""
  this.items = recipe.items || []
  this.quantities = recipe.quantities || {}
}


Recipe.getRecipes = async function () {
  const { data: recipes } = await API.get('/recipes/', {
    headers: { token: Auth.token },
  })
  return recipes
} 
Recipe.get = async function (recipeId) {
  if(!recipeId) throw new Error('recipeId param missing')
  const { data: recipe } = await API.get('/recipes/'+recipeId, {
    headers: { token: Auth.token },
  })
  return recipe
}
Recipe.createRecipe = async function (recipeToCreate) {
  if (!recipeToCreate) throw new Error('recipeToCreate param missing')
  const {data: recipe} = await API.post('/recipes', recipeToCreate, {
    headers: { token: Auth.token },
  })
  return recipe
}
Recipe.linkItems = async function (recipeId, itemsId) {
  if (!recipeId) throw new Error('recipeId param missing')
  if (!itemsId || !itemsId.length) throw new Error('itemsId param missing or empty')
  await API.post(`/recipes/${recipeId}/link-items`, itemsId, {
    headers: { token: Auth.token },
  })
} 

Recipe.deleteLink = async function (recipeId, itemId) {
  if (!recipeId) throw new Error('recipeId param missing')
  if (!itemId) throw new Error('itemId param missing')
  await API.delete(`/recipes/${recipeId}/link-items/${itemId}`, {
    headers: { token: Auth.token },
  })
} 

Recipe.deleteRecipe = async function (recipeId) {
  if (!recipeId) throw new Error('recipeId param missing')
  await API.delete('/recipes/' + recipeId, {
    headers: { token: Auth.token },
  })
} 


export default Recipe
