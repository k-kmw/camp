const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.index = async (req, res)=> {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.showCampground = async (req, res)=> {
    const {id} = req.params;
    // console.log(id);
    const camp = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!camp) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground: camp}); 
}

module.exports.createCamp = async (req, res, next) => {
    const geoData = await geocodingClient.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    })
    .send()
    const newCamp = new Campground(req.body.campground);
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.image = req.files.map(file => ({url: file.path, filename: file.filename}))
    newCamp.author = req.user._id;
    await newCamp.save();
    console.log(newCamp);
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`campgrounds/${newCamp._id}`);
}

module.exports.renderEditForm = async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    console.log(campground);
    if(!campground) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.editCamp = async(req, res) => {
    console.log(req.body);
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, {runValidators: true, new: true});
    const imgs = req.files.map(file => ({url: file.path, filename: file.filename}))
    campground.image.push(...imgs)
    campground.save();
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename); 
        }
        await campground.updateOne({$pull: {image: {filename: {$in: req.body.deleteImages}}}});
    }
    req.flash('success', 'Successfully update a campground');
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteCamp = async(req, res) => {
    await Campground.findByIdAndRemove(req.params.id);
    req.flash('success', 'Successfully delete a campground');
    res.redirect('/campgrounds');
}