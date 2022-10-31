import Mongoose from 'mongoose';
import { useVirtualId } from '../database/database.js';

const categorySchema = new Mongoose.Schema({
    mainCategory: String,
    subCategory:{type: Array, default: []}
});

useVirtualId(categorySchema);
const Category = Mongoose.model('Category', categorySchema);

export async function findByMainCategory(mainCategory){
    return Category.findOne({mainCategory})
}

export async function createCategory(category){
    console.log("createCategory 실행")
    const newCategory = {
        mainCategory: category.mainCategory,
        subCategory: [category.subCategory]
    }
    return new Category(newCategory).save().then((data) => data.id);
}

export async function crateSubCategory(mainCategory, subCategory){
    return Category.findOneAndUpdate({mainCategory}, {$addToSet:{subCategory}})
}

export async function getAll(){
    return Category.find({})
}

