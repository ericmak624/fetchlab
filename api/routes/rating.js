const router = require('express').Router();
const { RatingController } = require('../controller');

router.get('/:id', RatingController.getRatingWithId);

router.post('/', RatingController.lazyLoadRatings);

module.exports = router;