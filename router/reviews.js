const express = require('express');
const router = express.Router({mergeParams:true});
const {validateRieview, isLoggedIn, isReviewAuthor} = require('../middleware');
const catchAsync = require('../utils/catchAsync')
const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateRieview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;