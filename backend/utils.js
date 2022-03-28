import jwt from 'jsonwebtoken';
import mg from 'mailgun-js';

//function to generate token inorder to verify the user identity
export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); //remove Bearer from headers: {authorization: `Bearer ${userInfo.token}`,},
    // console.log('tokenUtils: ', token);
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        req.user = decode; //decode is the decrypted version of token that contain userInfo
        next(); //next() means use the output of the middleware in other function or api or route
      }
    });
  } else {
    res.status(401).send({ message: 'No Token' });
  }
};

export const isAdmin = (req, res, next) => {
  //we have already store user info onto req.user in isAuth() middleware as a result we have access to user info already
  if (req.user && req.user.isAdmin) {
    next(); //means process to the next middleware or function or continue executing the api
  } else {
    res.status(401).send({ message: 'Invalid Admin Token' });
  }
};

export const mailgun = () =>
  mg({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });

// export const payOrderEmailTemplate = (order) => {
//   return `
//     <h1>Thanks for shopping with us</h1>
//     <p>Hi ${order.user.name},</p>
//     <p>We have finished processing your order.</p>
//     <h2>[Order ${order._id}] (${order.createdAt
//     .toString()
//     .substring(0, 10)})</h2>
//     <table>
//       <thead>
//         <tr>
//           <td><strong>Product</strong></td>
//           <td><strong>Quantity</strong></td>
//           <td><strong align='right'>Price</strong></td>
//         </tr>
//       </thead>
//       <tbody>
//       ${order.orderItems
//         .map(
//           (item) => `
//         <tr>
//           <td>${item.name}</td>
//           <td align='center'>${item.quantity}</td>
//           <td align='right'>${item.price.toFixed(2)}</td>
//         </tr>
//       `
//         )
//         .join('\n')}
//       </tbody>

//       <tfoot>
//         <tr>
//           <td colspan='2'>Items Price:</td>
//           <td align='right'>₦${order.itemsPrice.toFixed(2)}</td>
//         </tr>
//         <tr>
//           <td colspan='2'>Shipping Price:</td>
//           <td align='right'>₦${order.shippingPrice.toFixed(2)}</td>
//         </tr>
//         <tr>
//           <td colspan='2'>Total Price:</td>
//           <td align='right'><strong>₦${order.totalPrice.toFixed(
//             2
//           )}</strong></td>
//         </tr>
//         <tr>
//           <td colspan='2'>Payment Method:</td>
//           <td align='right'>${order.paymentMethod}</td>
//         </tr>
//     </tfoot>
//   </table>

//   <h2>Shipping Address</h2>
//   <p>
//     ${order.shippingAddress.fullName}, <br/>
//     ${order.shippingAddress.address}, <br/>
//     ${order.shippingAddress.city}, <br/>
//     ${order.shippingAddress.country}, <br/>
//     ${order.shippingAddress.postalCode}, <br/>
//   </p>
//   <hr/>
//   <p>
//     Thanks for shopping with us. <br/>
//     <a href='https://mern-amazona6032022.herokuapp.com'>Click here to shop more</a>
//   </p>
//   `;
// };

export const payOrderEmailTemplate = (order) => {
  return `
    <h1>Thanks for shopping with us</h1>
    <p>Hi ${order.user.name},</p>
    <p>We have finished processing your order.</p>
    <h2>[Order ${order._id}] (${order.createdAt
    .toString()
    .substring(0, 10)})</h2>
    <table>
      <thead>
        <tr>
          <td><strong align='left'>Image</strong></td>
          <td><strong>Product</strong></td>
          <td><strong>Quantity</strong></td>
          <td><strong align='center'>Price</strong></td>
        </tr>
      </thead>
      <tbody>
      ${order.orderItems
        .map(
          (item) => `
        <tr>
          <td align='left' width='3rem' height='3rem'>
          <img src=${item.image} style="max-width:3rem; max-height:3rem";/>
          </td>
          <td>${item.name}</td>
          <td align='center'>${item.quantity}</td>
          <td align='right'>${item.price.toFixed(2)}</td>
        </tr>
      `
        )
        .join('\n')}
      </tbody>

      <tfoot>
        <tr>
          <td colspan='3'>Items Price:</td>
          <td align='right'>₦${order.itemsPrice.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan='3'>Shipping Price:</td>
          <td align='right'>₦${order.shippingPrice.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan='3'>Total Price:</td>
          <td align='right'><strong>₦${order.totalPrice.toFixed(
            2
          )}</strong></td>
        </tr>
        <tr>
          <td colspan='3'>Payment Method:</td>
          <td align='right'>${order.paymentMethod}</td>
        </tr>
    </tfoot>
  </table>

  <h2>Shipping Address</h2>
  <p>
    ${order.shippingAddress.fullName}, <br/>
    ${order.shippingAddress.address}, <br/>
    ${order.shippingAddress.city}, <br/>
    ${order.shippingAddress.country}, <br/>
    ${order.shippingAddress.postalCode}, <br/>
  </p>
  <hr/>
  <p>
    Thanks for shopping with us. <br/>
    <a href='https://mern-amazona6032022.herokuapp.com'>Click here to shop more</a>
  </p>
  `;
};
