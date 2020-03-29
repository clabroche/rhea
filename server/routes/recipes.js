var express = require('express');
var router = express.Router();
const authentification = require('../middleware/auth')
const Recipes = require('../services/Recipes')

router.get('/', authentification, async function (req, res, next) {
  const recipes = await Recipes.all(req.user._id)
  res.json(recipes)
})

router.get('/:recipeId', authentification, async function (req, res, next) {
  const recipe = await Recipes.get(req.user._id, req.params.recipeId)
  res.json(recipe)
})

router.post('/', authentification, async function (req, res, next) {
  const recipes = await Recipes.create(req.user._id, req.body)
  res.json(recipes)
})

router.post('/:recipeId/link-items', authentification, async function (req, res, next) {
  await Recipes.linkItems(req.user._id, req.params.recipeId, req.body)
  res.json(true)
})

router.delete('/:recipeId/link-items/:itemId', authentification, async function (req, res, next) {
  await Recipes.removeLinkItems(req.user._id, req.params.recipeId, req.params.itemId)
  res.json(true)
})

router.delete('/:recipeId', authentification, async function (req, res, next) {
  await Recipes.delete(req.user._id, req.params.recipeId)
  res.json(true)
})

module.exports = router;
