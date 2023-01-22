const express = require('express')
const router = express.Router({mergeParams: true})

const Campground = require('../models/campground');
const Review = require('../models/review')

const {reviewSchema} = require('../schema.js')

const Expresserror = require('../utils/Expresseror')
const CatchAsync = require('../utils/CatchAsync')
const {validateReview, isLoggedIn} = require('../middleware')






router.post('/', isLoggedIn, CatchAsync(async(req, res) => {
    console.log(req.params)
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id;
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', isLoggedIn, CatchAsync(async(req, res) => {
    const {id, reviewId} = req.params;
     await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
     await Review.findByIdAndDelete(reviewId)
     res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;