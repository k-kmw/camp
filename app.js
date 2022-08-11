const express = require('express');
const path = require('path');
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const Campground = require('./models/campground')
mongoose.connect('mongodb://localhost:27017/camp', {
    useNewUrlParser: true
});

const db = mongoose.connection;
db.on('error', err => {
    console.log(err);
  });
db.once("open", ()=> {
    console.log("Database connected");
})
const app = express();
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));

app.get('/', (req, res)=> {
    res.render('home')
})

app.get('/campgrounds', async (req, res)=> {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.get('/campgrounds/:id', async (req, res)=> {
    const {id} = req.params;
    // console.log(id);
    const camp = await Campground.findById(id);
    // console.log(camp);
    res.render('campgrounds/show', {camp});
})

app.post('/campgrounds', async (req, res) => {
    const newCamp = new Campground(req.body.campground);
    // await Campground.insertMany(newCamp);
    await newCamp.save();
    res.redirect(`campgrounds/${newCamp._id}`);
})

app.get('/campgrounds/:id/edit', async(req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {camp});
})

app.put('/campgrounds/:id', async(req, res) => {
    const {id} = req.params;
    // console.log(req.body.campground);
    await Campground.findByIdAndUpdate(id, req.body.campground, {runValidators: true, new: true});
    res.redirect(`/campgrounds/${id}`);
})

app.delete('/campgrounds/:id', async(req, res) => {
    // console.log(req.body.campground);
    await Campground.findByIdAndRemove(req.params.id);
    res.redirect('/campgrounds');
})

app.listen(3000, ()=>{
    console.log("PORT 3000");
})

