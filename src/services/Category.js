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


Category.getCategories = async function () {
  const { data: categories } = await API.get('/categories/', {
    headers: { token: Auth.token },
  })
  return categories
} 
Category.get = async function (categoryId) {
  if(!categoryId) throw new Error('categoryId param missing')
  const { data: category } = await API.get('/categories/'+categoryId, {
    headers: { token: Auth.token },
  })
  console.log(category)
  return category
}
Category.createCategory = async function (categoryToCreate) {
  if (!categoryToCreate) throw new Error('categoryToCreate param missing')
  await API.post('/categories', categoryToCreate, {
    headers: { token: Auth.token },
  })
}
Category.linkItems = async function (categoryId, itemsId) {
  if (!categoryId) throw new Error('categoryId param missing')
  if (!itemsId || !itemsId.length) throw new Error('itemsId param missing or empty')
  await API.post(`/categories/${categoryId}/link-items`, itemsId, {
    headers: { token: Auth.token },
  })
} 

Category.deleteLink = async function (categoryId, itemId) {
  if (!categoryId) throw new Error('categoryId param missing')
  if (!itemId) throw new Error('itemId param missing')
  await API.delete(`/categories/${categoryId}/link-items/${itemId}`, {
    headers: { token: Auth.token },
  })
} 

Category.deleteCategory = async function (categoryId) {
  if (!categoryId) throw new Error('categoryId param missing')
  await API.delete('/categories/' + categoryId, {
    headers: { token: Auth.token },
  })
} 


export default Category
