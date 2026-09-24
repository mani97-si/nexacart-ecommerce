import Wishlist from '../models/Wishlist.js';
export async function getWishlist(req,res){let w=await Wishlist.findOne({user:req.user._id}).populate('products');if(!w)w=await Wishlist.create({user:req.user._id,products:[]});res.json(w)}
export async function toggleWishlist(req,res){let w=await Wishlist.findOne({user:req.user._id});if(!w)w=await Wishlist.create({user:req.user._id,products:[]});const i=w.products.findIndex(x=>String(x)===String(req.body.productId));if(i>=0)w.products.splice(i,1);else w.products.push(req.body.productId);await w.save();res.json(await w.populate('products'))}
