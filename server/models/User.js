import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 email:{type:String,required:true,unique:true,lowercase:true,trim:true},
 password:{type:String,required:true,minlength:6},
 role:{type:String,enum:['user','admin'],default:'user'},
 avatar:String,
 phone:String,
 address:{street:String,city:String,state:String,zip:String,country:String}
},{timestamps:true});
export default mongoose.model('User',schema);
