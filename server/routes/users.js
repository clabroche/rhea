var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
const {v4: uuid} = require('uuid')
const {mongo} = require('../helpers/mongoConnect')
const authMiddleWare = require('../middleware/auth')
/* GET home page. */
router.get('/', authMiddleWare, async function(req, res, next) {
  res.json(req.user)
})
router.get('/all', authMiddleWare, async function(req, res, next) {
  const users = await mongo.collection('users').find().toArray()
  res.json(users)
})
router.get('/:id', async (req, res, next) => {
  const user = await mongo.collection('users').findOne({_id: mongo.getID(req.params.id)})
  if(!user) {
    return res.status(404).json('User Not Found')
  }
  res.json(user)
})
router.post('/me', authMiddleWare, async (req, res, next) => {
  const userToInsert = req.body
  if(!userToInsert) return res.status(400).send('Please provide user in body')
  if(mongo.getID(userToInsert._id).toString() !== mongo.getID(req.user._id).toString())
    return res.status(400).send('User to insert is different than authenticated user')
  const _id = mongo.getID(userToInsert._id)
  delete userToInsert._id
  await mongo.collection('users').updateOne({_id}, {$set: userToInsert})
  res.json(userToInsert)
})
router.get('/share/:userId', authMiddleWare, async (req, res, next) => {
  const users = await mongo.collection('users').find({
    shared: {
        $in:[mongo.getID(req.user._id),] 
    }
  }).toArray()
  res.json(users)
})
router.post('/share/:userId', authMiddleWare, async (req, res, next) => {
  if(!req.user.shared) req.user.shared = [] 
  req.user.shared = req.user.shared.filter(u => mongo.getID(u).toString() !== mongo.getID(req.params.userId).toString())
  req.user.shared.push(mongo.getID(req.params.userId))
  await mongo.collection('users').updateOne({_id: req.user._id}, {$set:{shared: req.user.shared}})
  res.json(true)
})
router.delete('/share/:userId', authMiddleWare, async (req, res, next) => {
  if(!req.user.shared) req.user.shared = [] 
  req.user.shared = req.user.shared.filter(u => mongo.getID(u).toString() !== mongo.getID(req.params.userId).toString())
  await mongo.collection('users').updateOne({_id: req.user._id}, {$set:{shared: req.user.shared}})
  res.json(true)
})
router.post('/login', async function(req, res, next) {
  const user = await mongo.collection('users').findOne({email: req.body.email})
  if(!user) {
    return res.status(404).send('User not Found')
  }
  await generateToken(req.body)
  res.json(req.body.token)
});
router.post('/register', async function(req, res, next) {
  const user = await mongo.collection('users').findOne({email: req.body.email})
  if(user) {
    return res.status(400).send('User already exist')
  }
  const hash = await bcrypt.hash(req.body.password, 10)
  await mongo.collection('users').insertOne({
    email: req.body.email,
    password: hash
  })
  await generateToken(req.body)
  res.json(req.body.token)
});

async function generateToken(user) {
  user.token = uuid()
  await mongo.collection('users').updateOne({email: user.email}, {$push: {tokens: user.token}})
  return user.token
}

module.exports = router