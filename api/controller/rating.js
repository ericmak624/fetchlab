const request = require('request-promise');
const { Rating } = require('../../database');
const config = require('config');
const cheerio = require('cheerio');
const chalk = require('chalk');
const jwt = require('jsonwebtoken');

const omdb_host = config.omdb.host || process.env.OMDB_HOST;
const omdb_apiKey = config.omdb.apiKey || process.env.OMDB_APIKEY;
const secret = config.jwt.secret || process.env.JWT_SECRET;

const getDoubanRating = (imdb_id) => {
  const options = {
    uri: 'https://api.douban.com/v2/movie/search',
    qs: { q: imdb_id }
  };
  const response = { id: null, rating: null };

  return request(options)
    .then((body) => {
      body = JSON.parse(body);
      if (body.total === 0 || !body.subjects.length || !body.subjects[0].rating) {
        return response;
      }
      response.id = body.subjects[0].id; // Get douban id for http link
      response.rating = body.subjects[0].rating.average.toString();
      return response;
    })
    .catch((err) => response);
};

const getIMDBRating = (id) => {
  let response = { id, rating: null };
  const options = {
    uri: omdb_host,
    qs: { apiKey: omdb_apiKey, i: id }
  };

  return request(options)
    .then((body) => {
      const detail = JSON.parse(body);
      if (detail.imdbRating !== 'N/A') {
        response.rating = detail.imdbRating;
        throw response;
      }
      return request.get(`http://www.imdb.com/title/${id}`);
    })
    .then((html) => {
      const $ = cheerio.load(html);
      const imdbRating = $('span', '.ratingValue').text(); // -> '7.6/10.0'
      response.rating = imdbRating.substring(0, imdbRating.indexOf('/'));
      return response;
    })
    .catch((err) => response);
};

module.exports.lazyLoadRatings = (req, res) => {
  
};

module.exports.getRatingWithId = (req, res) => {
  let response, decoded;
  const [type, token] = req.headers.authorization.split(' ');

  try {
    decoded = jwt.verify(token, secret);
  } catch(err) {
    return res.sendStatus(401);
  }
  
  Rating.findOne({ 'imdb.id': decoded.id }).exec()
    .then((data) => {
      if (data) {
        response = JSON.stringify(data);
        throw response;
      }
      return Promise.all([
        getDoubanRating(id),
        getIMDBRating(id)
      ]);
    })
    .then(([douban, imdb]) => {
      const obj = { douban, imdb };
      Rating.create(obj, null);
      return res.send(JSON.stringify(obj));
    })
    .catch((err) => {
      if (response) { // No error, just skipping the last then section
        return res.send(response);
      }
      console.log(chalk.red('error in getRatingWithId: ', err));
      return res.sendStatus(400);
    });

};