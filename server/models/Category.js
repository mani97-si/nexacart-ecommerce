import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true,unique:true},slug:{type:String,required:true,unique:true},description:String,image:String},{timestamps:true});
export default mongoose.model('Category',schema);
