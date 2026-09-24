import mongoose from 'mongoose';
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',unique:true},products:[{type:mongoose.Schema.Types.ObjectId,ref:'Product'}]},{timestamps:true});
export default mongoose.model('Wishlist',schema);
