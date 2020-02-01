'use strict'

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const ObjectID = require('mongodb').ObjectID

function MongoConnect() {
  this.db = null
  this.url = null
  this.client = null
}


/* Promisify setTimeout function */
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

MongoConnect.prototype.connect = async function(url) {
  try {
    if (this.db) return this.db
    let db = url.split('/')[3].split('?')[0]
    this.url = url
    const client = await MongoClient.connect(url, {poolSize: 10, useNewUrlParser: true})
    this.client = client
    this.db = client.db(db)
    this.db.on('close', () => {
      this.db = null
    })
    await this.createIndexes()
    return this.db
  } catch (err) {
    console.error(err)
    console.info('Trying to reconnect in 5 secs.')
    await wait(5000)
    return this.connect(url)
  }
}

MongoConnect.prototype.get = function() {
  if(this.db) return this.db 
  throw new Error('DB not instanciate: call mongo.connect(url) before')
}

MongoConnect.prototype.collection = function(collectionName) {
  return this.get().collection(collectionName)
}

/**
 * Get a date from an ObjectID
 * @param {ObjectID} objectID
 * @return {Date}
 */
MongoConnect.prototype.getDateFromMongoId = function(objectID) {
  return new Date(parseInt( objectID.toString().substring(0,8), 16 ) * 1000)
}

/**
 * Create all indexes
 */
MongoConnect.prototype.createIndexes = async function() {
  await this.db.collection('clickrecommendation').createIndex({ sessionId: 1 })
  await this.db.collection('purchase').createIndex({ sessionId: 1 })
  await this.db.collection('purchase').createIndex({ userId: 1 })
}

/**
 * Function that get the correct id
 * @param {ObjectID | String} id
 **/
MongoConnect.prototype.getID = id => {
  return ObjectID.isValid(id)
    ? (new ObjectID(id))
    : id
}

MongoConnect.prototype.minimumIdFromTime = function(time) {
  return Math.round(time.unix()).toString(16) +  '0000000000000000'
}

module.exports = MongoConnect
module.exports.mongo = new MongoConnect()