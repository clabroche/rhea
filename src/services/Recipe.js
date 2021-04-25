import API from './API'
import Auth from './Auth'
class Recipe {
  /**
   * @param {Recipe | {[key: string]: any}} recipe 
   */
  constructor(recipe = {}) {
    this._id = recipe._id || null
    this.name = recipe.name || ""
    this.items = recipe.items || []
    this.quantities = recipe.quantities || {}
    this.itemsId = recipe.itemsId || {}
  }
  static async getRecipes() {
    let { data: recipes } = await API.get('/recipes/', {
      headers: { token: Auth.token },
    })
    if(!recipes) recipes = []
    return recipes.map(recipe => new Recipe(recipe))
  } 
  static async get(recipeId) {
    if(!recipeId) throw new Error('recipeId param missing')
    const { data: recipe } = await API.get('/recipes/'+recipeId, {
      headers: { token: Auth.token },
    })
    return new Recipe(recipe)
  }
  static async createRecipe(recipeToCreate) {
    if (!recipeToCreate) throw new Error('recipeToCreate param missing')
    const {data: recipe} = await API.post('/recipes', recipeToCreate, {
      headers: { token: Auth.token },
    })
    return recipe
  }
  static async linkItems(recipeId, itemsId) {
    if (!recipeId) throw new Error('recipeId param missing')
    if (!itemsId || !itemsId.length) throw new Error('itemsId param missing or empty')
    await API.post(`/recipes/${recipeId}/link-items`, itemsId, {
      headers: { token: Auth.token },
    })
  } 
  
  static async deleteLink(recipeId, itemId) {
    if (!recipeId) throw new Error('recipeId param missing')
    if (!itemId) throw new Error('itemId param missing')
    await API.delete(`/recipes/${recipeId}/link-items/${itemId}`, {
      headers: { token: Auth.token },
    })
  } 
  
  async deleteRecipe() {
    await API.delete('/recipes/' + this._id, {
      headers: { token: Auth.token },
    })
  } 
}

export default Recipe
