const mongoose = require('mongoose');
const Campground = require('../models/campground')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')

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

const getArrayValue = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0; i<200; i++) {
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*30000) + 10000
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${getArrayValue(descriptors)}, ${getArrayValue(places)}`,
            author: '6303376317e15d57758d87cd',
            geometry: { 
                type: 'Point', 
                coordinates: [ 
                    cities[random1000].longitude, cities[random1000].latitude 
                ] 
            },
            image: [
                {
                    url: 'https://res.cloudinary.com/dcklojwo4/image/upload/v1661260520/Camp/tyuo1oqeck9f4qseuned.jpg',
                    filename: 'Camp/tyuo1oqeck9f4qseuned',
                },
                {
                    url: 'https://res.cloudinary.com/dcklojwo4/image/upload/v1661260522/Camp/tdv2g09qg1bflzgbu7dl.jpg',
                    filename: 'Camp/tdv2g09qg1bflzgbu7dl',
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste sequi possimus totam sit unde culpa. Et nobis hic vel quaerat minima illo laudantium excepturi voluptas cum, reiciendis voluptatibus quae dicta.',
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})