const express = require('express')
const router = express.Router()
const CatchAsync = require('../utils/CatchAsync')
const Expresserror = require('../utils/Expresseror')
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds')
const {campgroundSchema, reviewSchema} = require('../schema.js')
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')
const passport = require('passport');
const campground = require('../models/campground');
const {storage} = require('../cloudinary')
const multer = require('multer')
const uploads = multer({storage})
const {cloudinary} = require('../cloudinary')




router.get('/', CatchAsync(campgrounds.index));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
});

router.post('/',uploads.array('image'),isLoggedIn, validateCampground, CatchAsync(async (req, res, next) => {
    if(!req.body.campground) throw new Expresserror('invalid campground', 400)
    const campground = new Campground(req.body.campground)
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.author = req.user._id
    console.log(campground)
    console.log('it worked')
    await campground.save()
    req.flash('success', 'Successfully created a campground')
    res.redirect(`/campgrounds/${campground._id}`)
    res.send('it worked')
}));


router.get('/:id', CatchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if(!campground) {
        req.flash('errpr', 'cannot find the campground')
    }
    res.render('campgrounds/show', {campground})
}));


router.get('/:id/edit', isLoggedIn, isAuthor, CatchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
}));

router.put('/:id',uploads.array('image'), isLoggedIn, isAuthor, CatchAsync(async (req, res) => {
    const {id} = req.params
    const {deleteImages} = req.body
    console.log(deleteImages)
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));    
    campground.images.push(...imgs)
    await campground.save()
    if(req.body.deleteImages) {
        for(let filename of deleteImages) {
            cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({$pull: {images: {filename: {$in: deleteImages}}}})
    }
    req.flash('success', 'Successfully updated the campground')
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete('/:id', isLoggedIn, CatchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}));

module.exports = router;