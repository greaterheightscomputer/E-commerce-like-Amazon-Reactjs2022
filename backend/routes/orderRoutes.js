import express from 'express';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import { isAdmin, isAuth, mailgun, payOrderEmailTemplate } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

const orderRouter = express.Router();

//api to fetch all users orders from mongodb
orderRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name'); //collection relationship
    res.send(orders);
  })
);

//api to insert or store order in mongodb
orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })), //renaming _id property to product
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id, //isAuth is the middleware that is response for store value to req.user object
    });
    const order = await newOrder.save();
    res.status(201).send({ message: 'New Order Created', order });
  })
);

//api to fetch app summary from mongodb
orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    //aggregate function operate on multiple documents and return computed results.
    const orders = await Order.aggregate([
      {
        //$group-> its called group pipeline
        $group: {
          _id: null, //means group all documents in a order collection by null
          numOrders: { $sum: 1 }, //sum all documents in order collection
          totalSales: { $sum: '$totalPrice' }, //sum all totalPrice in the order collection
        },
      },
    ]);

    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);

    const dailyOrders = await Order.aggregate([
      {
        $group: {
          //$dateToString means using data to string function, group order collection by createdAt date with Year-month-day date format
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } }, //sort based on the id in accending order
    ]);

    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category', //group Product collection by category
          count: { $sum: 1 }, //count the number of document or row in each category
        },
      },
    ]);
    res.send({ users, orders, dailyOrders, productCategories });
  })
);

//api to fetch current user orders
orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }); //req.user is coming from isAuth middleware
    res.send(orders);
  })
);

//api to fetch a single record or document from mongodb
orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

//api to update isDelivered field in mongodb
orderRouter.put(
  '/:id/deliver',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      res.send({ message: 'Order Delivered' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

//api to update isPaid field in mongodb
orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name'
    );
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address || req.body.payer.email_address,
      };
      const updatedOrder = await order.save();

      //send email receipt to users
      mailgun()
        .messages()
        .send(
          {
            from: 'Amazona<amazona@mg.yourdomain.com>',
            to: `${order.user.name} <${order.user.email}>`,
            subject: `New order ${order._id}`,
            html: payOrderEmailTemplate(order), //content of the email
          },
          (error, body) => {
            if (error) {
              console.log(error);
            } else {
              console.log(body);
            }
          }
        );
      //send email receipt to users

      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

//api to delete order from in mongodb
orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.remove();
      res.send({ message: 'Order Deleted' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);
export default orderRouter;
