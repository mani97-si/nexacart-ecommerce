import mongoose from 'mongoose';
const itemSchema=new mongoose.Schema({product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},name:String,image:String,price:Number,quantity:Number},{_id:false});
const schema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},items:[itemSchema],
 shippingAddress:{name:String,street:String,city:String,state:String,zip:String,country:String,phone:String},
 subtotal:Number,shipping:Number,tax:Number,total:Number,
 paymentMethod:{type:String,default:'Cash on Delivery'},
 status:{type:String,enum:['Placed','Processing','Shipped','Out for Delivery','Delivered','Cancelled'],default:'Placed'},
 deliveredAt:Date
},{timestamps:true});
export default mongoose.model('Order',schema);
