import Product from '../models/Product.js';
export async function listProducts(req,res){
 const {search='',category,sort='newest',min=0,max=999999}=req.query;
 const filter={price:{$gte:Number(min),$lte:Number(max)}};
 if(search) filter.$or=[{name:{$regex:search,$options:'i'}},{brand:{$regex:search,$options:'i'}},{tags:{$regex:search,$options:'i'}}];
 if(category) filter.category=category;
 const sortMap={priceAsc:{price:1},priceDesc:{price:-1},rating:{rating:-1},newest:{createdAt:-1},popular:{reviewCount:-1}};
 const products=await Product.find(filter).populate('category','name slug').sort(sortMap[sort]||sortMap.newest);
 res.json(products);
}
export async function getProduct(req,res){
 const p=await Product.findById(req.params.id).populate('category','name slug');
 if(!p)return res.status(404).json({message:'Product not found'}); res.json(p);
}
export async function createProduct(req,res){res.status(201).json(await Product.create(req.body))}
export async function updateProduct(req,res){
 const p=await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
 if(!p)return res.status(404).json({message:'Product not found'}); res.json(p);
}
export async function deleteProduct(req,res){await Product.findByIdAndDelete(req.params.id);res.json({message:'Product deleted'})}
