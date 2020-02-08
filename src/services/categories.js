import API from './API'
import Auth from './Auth'
/**
 * 
 * @param {Category} category 
 */
// @ts-ignore
// eslint-disable-next-line no-unused-vars
function Category(category = {}) {
  this._id = category._id || null
  this.name = category.name || ""
  this.items = category.items || []
}


Category.getCategories = async function() {
  const { data: categories } = await API.get('/categories/', {
    headers: { token: Auth.token },
  })
  return categories

} 


export default Category
