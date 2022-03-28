import express from 'express';
import Product from '../models/productModel.js';
import data from '../data.js';
import User from '../models/userModel.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
  // await Product.remove({}); //remove the previous data
  await Product.deleteMany({});
  const createdProducts = await Product.insertMany(data.products); //insert data from data.js file onto mongodb Product collection

  await User.deleteMany({});
  const createdUsers = await User.insertMany(data.users);
  res.send({ createdProducts, createdUsers }); //send products to frontend
});

export default seedRouter;
