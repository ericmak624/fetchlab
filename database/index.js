const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://localhost/fetchlab';
mongoose.connect(uri, { useMongoClient: true });
mongoose.Promise = global.Promise;

const Rating = mongoose.model('Rating', {
  'imdb.id': { type: String, index: true },
  'imdb.rating': String,
  'douban.id': String,
  'douban.rating': String
});

module.exports = { Rating };