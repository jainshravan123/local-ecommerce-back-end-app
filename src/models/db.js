let mongoose = require('mongoose')

console.log('process.env.MONGODB_URI : ', process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ECommerceAppDb', {useNewUrlParser: true}, (err) => {
    if (!err) {
        console.log('MongoDB connection succeeded.');
    } else {
        console.log('Error occurred while connecting to MongoDB : ', err);
    }
})

require('./product.model')