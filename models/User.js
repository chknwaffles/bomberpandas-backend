const mongoose = require('mongoose')
const schema = mongoose.schema

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
    },
    password: String,
    scores: []
})

const User = mongoose.model('User', userSchema)

export default User