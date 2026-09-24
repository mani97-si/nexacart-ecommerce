import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
 rating:{type:Number,min:1,max:5,required:true},comment:{type:String,required:true}
},{timestamps:true});
schema.index({product:1,user:1},{unique:true});
export default mongoose.model('Review',schema);
