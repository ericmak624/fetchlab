const router = require('express').Router();
const { RatingController } = require('../controller');

router.route('/')
  .get(RatingController.getRatingWithId)
  .post(RatingController.lazyLoadRatings);

module.exports = router;