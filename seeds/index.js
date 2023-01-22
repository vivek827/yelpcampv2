const mongoose = require('mongoose')
mongoose.set('strictQuery', true)
const Campground = require('../models/campground')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://0.0.0.0:27017/yelp-camp')
.then(() => {
    console.log('Database Successfully Connected')
})
.catch((err) => {
    console.log('Oops...! Something went wrong')
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({})
    for(let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 30 + 10);
        const camp = new Campground({
            author: '63bc103fc1e6845bd16de9c4',
            location: `${cities[random1000].city} ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas modi incidunt quis sunt at ipsa minus! Fuga, illum accusantium? A voluptate est quis unde aliquid porro repellat nulla facere adipisci.',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/do8u9oork/image/upload/v1674047475/YelpCamp/wt9umkfffgxslckhnrv2.jpg',
                    filename: 'YelpCamp/wt9umkfffgxslckhnrv2'
                }
            ]
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})