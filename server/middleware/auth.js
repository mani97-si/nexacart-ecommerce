import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req,res,next){
  try{
    const header=req.headers.authorization||'';
    const token=header.startsWith('Bearer ')?header.slice(7):null;
    if(!token) return res.status(401).json({message:'Authentication required'});
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    req.user=await User.findById(decoded.id).select('-password');
    if(!req.user) return res.status(401).json({message:'User not found'});
    next();
  }catch(e){ return res.status(401).json({message:'Invalid or expired token'}); }
}
export function adminOnly(req,res,next){
  if(req.user?.role!=='admin') return res.status(403).json({message:'Admin access required'});
  next();
}
