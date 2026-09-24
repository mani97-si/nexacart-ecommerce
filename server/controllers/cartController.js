import Cart from '../models/Cart.js';
const populated=c=>c.populate({path:'items.product',populate:{path:'category',select:'name'}});
export async function getCart(req,res){let c=await Cart.findOne({user:req.user._id});if(!c)c=await Cart.create({user:req.user._id,items:[]});res.json(await populated(c))}
export async function addToCart(req,res){
 const {productId,quantity=1}=req.body; let c=await Cart.findOne({user:req.user._id});if(!c)c=await Cart.create({user:req.user._id,items:[]});
 const item=c.items.find(x=>String(x.product)===String(productId)); if(item)item.quantity+=Number(quantity);else c.items.push({product:productId,quantity:Number(quantity)});
 await c.save();res.json(await populated(c));
}
export async function updateCart(req,res){const c=await Cart.findOne({user:req.user._id});const item=c.items.id(req.params.itemId);if(!item)return res.status(404).json({message:'Item not found'});item.quantity=Math.max(1,Number(req.body.quantity));await c.save();res.json(await populated(c))}
export async function removeFromCart(req,res){const c=await Cart.findOne({user:req.user._id});c.items.pull(req.params.itemId);await c.save();res.json(await populated(c))}
