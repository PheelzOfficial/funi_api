const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    quantity:{
        type: Number,
        default: 1
    },
    date:{
        type: Date,
        default: Date.now()
    }
})


module.exports = mongoose.model("Cart", cartSchema)