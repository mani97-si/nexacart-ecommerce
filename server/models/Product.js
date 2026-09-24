import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},slug:{type:String,unique:true},description:String,
 price:{type:Number,required:true,min:0},compareAtPrice:{type:Number,min:0},
 category:{type:mongoose.Schema.Types.ObjectId,ref:'Category',required:true},
 images:[String],stock:{type:Number,default:0,min:0},brand:String,
 tags:[String],rating:{type:Number,default:0,min:0,max:5},reviewCount:{type:Number,default:0}
},{timestamps:true});
export default mongoose.model('Product',schema);
