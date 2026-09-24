import User from '../models/User.js';import Product from '../models/Product.js';import Order from '../models/Order.js';
export async function stats(req,res){
 const [users,products,orders,sales]=await Promise.all([User.countDocuments(),Product.countDocuments(),Order.countDocuments(),Order.aggregate([{$match:{status:{$ne:'Cancelled'}}},{$group:{_id:null,total:{$sum:'$total'}}}])]);
 const monthly=await Order.aggregate([{$match:{createdAt:{$gte:new Date(new Date().setMonth(new Date().getMonth()-5))},status:{$ne:'Cancelled'}}},{$group:{_id:{$dateToString:{format:'%Y-%m',date:'$createdAt'}},sales:{$sum:'$total'},orders:{$sum:1}}},{$sort:{_id:1}}]);
 res.json({users,products,orders,revenue:sales[0]?.total||0,monthly});
}
