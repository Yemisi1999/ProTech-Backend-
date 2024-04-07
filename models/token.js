import mongoose, { Schema } from 'mongoose';



const userTokenSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Users' 
  },
  token: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now(), 
    expires: 1800 
  },
});

const UserToken = mongoose.model('UserToken', userTokenSchema);

export {UserToken};