const request = require('request-promise');
const { Rating } = require('../../database');
const config = require('config');
const cheerio = require('cheerio');
const chalk = require('chalk');

const omdb_host = config.omdb.host || process.env.OMDB_HOST;
const omdb_apiKey = config.omdb.apiKey || process.env.OMDB_APIKEY;

const getDoubanRating = async (imdb_id) => {
  const options = {
    uri: 'https://api.douban.com/v2/movie/search',
    qs: { q: imdb_id }
  };

  const result = { id: null, rating: null };
  const response = JSON.parse(await request(options));

  if (response.total !== 0) {
    result.id = response.subjects[0].id; // Get douban id for http link
    result.rating = response.subjects[0].rating.average.toString();
  }

  return result;
};

const getIMDBRating = async (id) => {
  const result = { id, rating: null };
  const options = {
    uri: omdb_host,
    qs: { apiKey: omdb_apiKey, i: id }
  };

  const response = JSON.parse(await request(options));

  if (response.imdbRating !== 'N/A') {
    result.rating = response.imdbRating;
  } else {
    const html = await request.get(`http://www.imdb.com/title/${id}`);
    const $ = cheerio.load(html);
    const imdbRating = $('span', '.ratingValue').text(); // -> '7.6/10.0'
    result.rating = imdbRating.substring(0, imdbRating.indexOf('/'));
  }

  return result;
};

const findOrCreateRating = async (id) => {
  try {
    let response = await Rating.findOne({ 'imdb.id': id }).exec();

    if (!response) {
      let douban = await getDoubanRating(id);
      let imdb = await getIMDBRating(id);
      response = { douban, imdb };
      Rating.create(response);
    }

    return response;
  } catch (err) {
    console.log('error in findOrCreateRating: ', err);
    return null;
  }
};

module.exports.lazyLoadRatings = (req, res) => {
  
};

module.exports.getRatingWithId = (req, res) => {
  const id = req.params.id;

  findOrCreateRating(id)
    .then((data) => {
      if (!data) {
        throw data;
      }
      res.send(JSON.stringify(data));
    })
    .catch((err) => {
      console.log('error findOrCreateRating: ', err);
      res.sendStatus(400);
    });
};
