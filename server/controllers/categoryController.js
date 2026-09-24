import Category from '../models/Category.js';
export async function listCategories(req,res){res.json(await Category.find().sort({name:1}))}
export async function createCategory(req,res){const {name,description,image}=req.body;const slug=name.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-');res.status(201).json(await Category.create({name,slug,description,image}))}
export async function updateCategory(req,res){res.json(await Category.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}))}
export async function deleteCategory(req,res){await Category.findByIdAndDelete(req.params.id);res.json({message:'Category deleted'})}
