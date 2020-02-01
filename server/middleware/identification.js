const {mongo} = require('../helpers/mongoConnect')
module.exports = async function(req, res, next) {
  req.user = await mongo.collection('users').findOne({$and: [
    {token: req.headers.token},
    {token: {$exists: true}}
  ]})
  if(req.user) {
    delete req.user.password
  }
  next()
}