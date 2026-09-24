import Review from '../models/Review.js';import Product from '../models/Product.js';
export async function productReviews(req,res){res.json(await Review.find({product:req.params.productId}).populate('user','name').sort({createdAt:-1}))}
export async function createReview(req,res){
 const {rating,comment}=req.body;const r=await Review.findOneAndUpdate({product:req.params.productId,user:req.user._id},{rating,comment},{upsert:true,new:true,setDefaultsOnInsert:true});
 const stats=await Review.aggregate([{$match:{product:r.product}},{$group:{_id:null,avg:{$avg:'$rating'},count:{$sum:1}}}]);
 await Product.findByIdAndUpdate(req.params.productId,{rating:stats[0]?.avg||0,reviewCount:stats[0]?.count||0});res.status(201).json(r);
}
