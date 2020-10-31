const {mongo} = require('../helpers/mongoConnect')
module.exports = async function(req, res, next) {
  const user = await mongo.collection('users').findOne({$and: [
    { tokens: { $in: [req.headers.token] } },
    { tokens: { $exists: true } }
  ]})
  if (!user && res.status) {
    return res.status(403).send('Not authorized')
  } else if(!user) {
    return next(Error('Not authorized'))
  }
  req.user = user
  res.user = user
  delete req.user.password
  next()
}