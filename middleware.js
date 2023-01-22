const {campgroundSchema, reviewSchema} = require('./schema.js')
const Expresseror = require('./utils/Expresseror')
const Campground = require('./models/campground')
const Review = require('./models/review')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        console.log(req.originalUrl)
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new Expresseror(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, ReviewId} = req.params
    const Review = await Review.findById(ReviewId)
    if(!Review.author.equals(req.review._id)) {
        req.flash('error', 'you do not have the permissions to do that')
        return res.redirect(`/campgrounds${id}`)
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new Expresseror(msg, 400)
    } else {
        next();
    }
}