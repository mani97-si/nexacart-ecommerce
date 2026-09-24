import User from '../models/User.js';
export async function me(req,res){res.json(req.user)}
export async function updateMe(req,res){const allowed=['name','phone','address','avatar'];const data={};for(const k of allowed)if(req.body[k]!==undefined)data[k]=req.body[k];res.json(await User.findByIdAndUpdate(req.user._id,data,{new:true}).select('-password'))}
export async function allUsers(req,res){res.json(await User.find().select('-password').sort({createdAt:-1}))}
export async function updateUser(req,res){res.json(await User.findByIdAndUpdate(req.params.id,{name:req.body.name,role:req.body.role},{new:true}).select('-password'))}
export async function deleteUser(req,res){await User.findByIdAndDelete(req.params.id);res.json({message:'User deleted'})}
