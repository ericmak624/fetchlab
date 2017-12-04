const router = require('express').Router();
const { RatingController } = require('../controller');

router.route('/:id')
  .get(RatingController.getRatingWithId)
  .post(RatingController.lazyLoadRatings);

module.exports = router;