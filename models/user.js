// const mongoose = require('mongoose');
import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Must provide name'],
        trim: true,
        maxlength: [45, 'Name cannot be more than 45 characters']
    },
    email: {
        type: String,
        required: [true, 'Must provide email'],
        trim: true,
        unique: true,
        maxlength: [35, 'Email cannot be more than 25 characters']
    },
    password_hash: {
        type: String,
        required: [true, 'Must provide password'],
        trim: true,
        min: [8, 'Password must be at least 8 characters'],
        max: 1024,
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    createdAt: {
        type: Date,
        trim: true,
        default: Date.now()
    },
}, { timestamps: true })

// module.exports = mongoose.model('Users', userSchema)
const Users = mongoose.model('Users', userSchema);
export default Users;