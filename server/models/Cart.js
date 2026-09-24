import mongoose from 'mongoose';
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',unique:true},items:[{product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},quantity:{type:Number,min:1}}]},{timestamps:true});
export default mongoose.model('Cart',schema);
