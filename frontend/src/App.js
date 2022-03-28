import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Badge from 'react-bootstrap/Badge';
import Container from 'react-bootstrap/Container';
import { LinkContainer } from 'react-router-bootstrap';
import { Store } from './Store';
import { useContext, useEffect, useState } from 'react';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import SignupScreen from './screens/SignupScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { getError } from './utils';
import SearchBox from './components/SearchBox';
import SearchScreen from './screens/SearchScreen';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardScreen from './screens/DashboardScreen';
import AdminRoute from './components/AdminRoute';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import MapScreen from './screens/MapScreen';

function App() {
  //accessing the state of the useContext() in the Store.js file
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { fullBox, cart, userInfo } = state;

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin';
  };

  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      //sending ajax request to backend to fetch category array of string
      try {
        const { data } = await axios.get('/api/products/categories');
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);

  return (
    <BrowserRouter>
      <div
        className={
          sidebarIsOpen //if sidebarIsOpen is true and fullBox is true use 'site-container active-cont d-flex flex-column full-box' otherwise 'site-container active-cont d-flex flex-column' for sidebarIsOpen
            ? fullBox
              ? 'site-container active-cont d-flex flex-column full-box'
              : 'site-container active-cont d-flex flex-column'
            : fullBox //if sidebarIsOpen is false and fullBox is true use 'site-container d-flex flex-column full-box' otherwise 'site-container d-flex flex-column' for sidebarIsOpen is not open
            ? 'site-container d-flex flex-column full-box'
            : 'site-container d-flex flex-column'
        }
      >
        <ToastContainer position="bottom-center" limit={1} />
        <header>
          <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
              <Button
                variant="dark"
                onClick={() => setSidebarIsOpen(!sidebarIsOpen)} //!sidebarIsOpen means toggle
              >
                <i className="fas fa-bars"></i> {/*to create handbugger menu*/}
              </Button>
              <LinkContainer to="/">
                <Navbar.Brand>amazona</Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <SearchBox />
                <Nav className="me-auto w-100 justify-content-end">
                  <Link to="/cart" className="nav-link">
                    Cart{' '}
                    {cart.cartItems.length > 0 && (
                      <Badge pill bg="danger">
                        {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>
                    )}
                  </Link>
                  {/*<NavDropdown title={userInfo.name}> title attribute here is the title of NavDropdown*/}
                  {userInfo ? (
                    <NavDropdown title={userInfo.name} id="basic-nav-dropdown">
                      <LinkContainer to="/profile">
                        <NavDropdown.Item>User Profile</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/orderhistory">
                        <NavDropdown.Item>Order History</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <Link
                        to="#signout"
                        className="dropdown-item"
                        onClick={signoutHandler}
                      >
                        Sign Out
                      </Link>
                    </NavDropdown>
                  ) : (
                    <Link className="nav-link" to="/signin">
                      Sign In
                    </Link>
                  )}
                  {userInfo && userInfo.isAdmin && (
                    <NavDropdown title="Admin" id="admin-nav-dropdown">
                      <LinkContainer to="/admin/dashboard">
                        <NavDropdown.Item>Dashboard</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/products">
                        <NavDropdown.Item>Products</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/orders">
                        <NavDropdown.Item>Orders</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/users">
                        <NavDropdown.Item>Users</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>

        <div
          className={
            sidebarIsOpen
              ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column'
              : 'side-navbar d-flex justify-content-between flex-wrap flex-column'
          }
        >
          <Nav className="flex-column text-white w-100 p-2">
            <Nav.Item>
              <strong>Categories</strong>
            </Nav.Item>
            {categories.map((category) => (
              <Nav.Item key={category}>
                <LinkContainer
                  to={`/search?category=${category}`} //to redirect user to search bar with category name
                  onClick={() => setSidebarIsOpen(false)} //once user click on the category type close the sidebar
                >
                  <Nav.Link>{category}</Nav.Link>
                  {/*display all the categorie*/}
                </LinkContainer>
              </Nav.Item>
            ))}
          </Nav>
        </div>

        <main>
          <Container className="mt-3">
            <Routes>
              <Route path="/search" element={<SearchScreen />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orderhistory"
                element={
                  <ProtectedRoute>
                    <OrderHistoryScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <MapScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    <OrderScreen />
                  </ProtectedRoute>
                }
              />
              <Route path="/placeorder" element={<PlaceOrderScreen />} />
              <Route path="/payment" element={<PaymentMethodScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/shipping" element={<ShippingAddressScreen />} />
              <Route path="/signin" element={<SigninScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/product/:slug" element={<ProductScreen />} />
              {/*Admin Routes*/}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <DashboardScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <OrderListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <ProductListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <UserListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/product/:id"
                element={
                  <AdminRoute>
                    <ProductEditScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/user/:id"
                element={
                  <AdminRoute>
                    <UserEditScreen />
                  </AdminRoute>
                }
              />
              <Route path="/" element={<HomeScreen />} />
            </Routes>
          </Container>
        </main>
        <footer>
          <div className="text-center">All rights reserved</div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;

//- open all the most recently created files in this app to remove unnecessary comment

//- startup both frontend and backend web server

//Choose Location on Google Map
//- create google map credentials by going to developers.google.com/maps
//- click on Get started button, you most have google account
//- if you are existing user you will be redirect dashboard
//- for a new user a dialogue box will display with No active billing accounts click on MANAGE BILLING ACCOUNTS it redirect to a page to enter your credit card detail inorder to enable billing for using google map
//- click on My First Project
//- click on NEW PROJECT
//- Project name: AmazonaEcommerce032022 and click on CREATE button
//You have just create a project on google cloud
//- click on SELECT PROJECT
//- click on the hanbugger -> click on Recent -> click on Google Maps Platform -> APIs ->
//Maps JavaScript API -> Enable it. Its for placing a map.
//Places API -> Enable it. Its for placing current user location
//- click on Credentials -> click on CREATE CREDENTIALS
//- click on API key and copy the API key-> AIzaSyCWnnA7JOCYYJwQo7jD3HGe0YXuSW1Cz68
//- open backend/.env file to past the API key like this
//GOOGLE_API_KEY=AIzaSyCWnnA7JOCYYJwQo7jD3HGe0YXuSW1Cz68
//- open backend/server.js file to implement an api to send google api key to frontend right after paypal api like this
// app.get('/api/keys/google', (req, res) => {
//   res.send({key: process.env.GOOGLE_API_KEY || ''});
// });
//- open backend/models/orderModel.js file inorder to add location object property onto shippingAddress object property
//- open App.js file add fullBox onto state inorder to display full screen of google map like this
// const { state, dispatch: ctxDispatch } = useContext(Store);
// const { fullBox, cart, userInfo } = state;
//- open Store.js to defined fullBox with false value in the initialState object
//- open App.js file to use the fullBox inside return selection by change this className from
// className={
//   sidebarIsOpen
//     ? 'd-flex flex-column site-container active-cont'
//     : 'd-flex flex-column site-container'
// }
//to this
// className={
//   sidebarIsOpen //if sidebarIsOpen is true and fullBox is true use 'site-container active-cont d-flex flex-column full-box' otherwise 'site-container active-cont d-flex flex-column' for sidebarIsOpen
//     ? fullBox
//       ? 'site-container active-cont d-flex flex-column full-box'
//       : 'site-container active-cont d-flex flex-column'
//     : fullBox //if sidebarIsOpen is false and fullBox is true use 'site-container d-flex flex-column full-box' otherwise 'site-container d-flex flex-column' for sidebarIsOpen is not open
//     ? 'site-container d-flex flex-column full-box'
//     : 'site-container d-flex flex-column'
// }
//- open Store.js file to add 'SET_FULLBOX_ON' and 'SET_FULLBOX_OFF' action type onto the reducer() function
//- open ShippingAddressScreen.js file to add to fullBox to state
//- go to the submitHandler() function in ShippingAddressScreen.js to add location: shippingAddress.location propery inside ctxDispatch payload property and in localStorage.setItem() method
//- add useEffect() method like this
// useEffect(() => {
//   ctxDispatch({ type: 'SET_FULLBOX_OFF' });
// }, [ctxDispatch, fullBox]);
//- right before Continue button add div tags with Choose Location on Map button
//- open index.css to add style onto map at the end of the index.css file
//- create MapScreen.js in screens folder
//- add MapScreen.js onto App.js file in the ProtectedRoute component selection of Route
//- import MapScreen from './screens/MapScreen'; onto App.js file
//- add useEffect() react hook method onto MapScreen.js
//- open Store.js file go to initialState object to add initial value onto
//shippingAddress.location object property
//change this
// shippingAddress: localStorage.getItem('shippingAddress')
//       ? JSON.parse(localStorage.getItem('shippingAddress'))
//       : {},
// to this
// shippingAddress: localStorage.getItem('shippingAddress')
//       ? JSON.parse(localStorage.getItem('shippingAddress'))
//       : { location: {} },
//- let checkout the result on the browser by clicking Choose Location On Map button on
//shippingScreen then it redirect us to MapScreen -> http://localhost:3000/map
//- go back to MapScreen.js before MapScreen() function declare the following
// const defaultLocation = { lat: 45.516, lng: -73.56 };
// const libs = ['places'];
//- fetch userinfo from state on MapScreen
//- implement fetch function in useEffect() react hook method inorder to fetch googleApiKey from backend
//- install react-google-maps/api from googleApi in frontend like this
// C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona6\frontend> npm i @react-google-maps/api@2.7.0
//- go back to MapScreen.js to import the following dependencies from '@react-google-maps/api' like this
// import { LoadScript, GoogleMap, StandaloneSearchBox, Marker } from '@react-google-maps/api';
//- go to the return selection of MapScreen.js to use the imported dependencies
//- implement both onLoad() and onIdle() functions right before return selection
//- implement both onLoadPlaces() and onPlacesChanged() right after onIdle() function
//- implement onMarkerLoad() function
//- implement onConfirm() function
//- open Store.js file to add SAVE_SHIPPING_ADDRESS_MAP_LOCATION action type onto reducer function
//- let checkout the result on the browser by clicking Choose Location On Map button on
//shippingScreen then it redirect us to MapScreen then enter your address on input field then
//click Confirm button and user will be redirected to shippingscreen.
//- let display Show On Map on OrderScreen in Shipping selection of OrderScreen by add this
// &nbsp;
// {order.shippingAddress.location &&
//   order.shippingAddress.location.lat && (
//     <a
//       target="_new"
//       href={`https://maps.google.com?q=${order.shippingAddress.location.lat}, ${order.shippingAddress.location.lng}`}
//     >
//     Show On Map
//     </a>
// )}
//- push the code to local and  remote git
//- C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona5> git status
//- C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona5> git add .
//- C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona5> git commit -m "Choose Location on Google Map"
//- for remote git
//C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona5\backend> git push

//Send Email Order Receipt
//- go to mailgun.com to login or create a new account with mailgun
//Work Email: greaterheightscomputer@gmail.com
//Password: 358074358074 (Use Twilio Authy) to generate password
//- for a new user click on GetStarted button enter your personal details and credit card number
//- click on Sending on the sidebar inorder to add new Domain new and verify you domain name after which its will be added to list of Domain names
//- click on the sandbox domain name for testing purpose
//- copy the sandbox domain key
//- open backend/.env file to past the sandbox
//- click on API key and copy the -> API key:
//- past it in backend/.env file
//- back to mailgun web to save the email of Recipient
//- enter the recipients email inside the Email address input field then click on Save Recipient button
//- its will the email you enter in the email list with unverfied status go to your email click
//on I Agree button and go back to mailgun web to refresh the web page its will change the
//email status from unverified t verified
//- install mailgun-js in the backend like this
//C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona6\backend> npm i mailgun-js@0.22.0
//- open backend/utils file to implement mailgun function by importing
// import mg from 'mailgun-js';
//- open orderRoutes.js file, go to orderRouter.put('/:id/pay') endpoint inorder to update the route to send email receipt to users right after const updatedOrder = await order.save(); then send the email
//- change this const order = await Order.findById(req.params.id);
//to this
// const order = await Order.findById(req.params.id).populate(
//   'user',
//   'email name'
// );
//its means get the email and name of the user that make the order from user collection
//- open backend utils.js file to implement payOrderEmailTemplate() function right after mailgun() function
//- open orderRoutes.js file to mailgun and payOrderEmailTemplate function like this
// import { mailgun, payOrderEmailTemplate } from '../utils.js';
//- stop backend web server and startup again becos of the newly added environment variables in .env file
//- let test the app by entering one of the email use in Recipient selection of mailgun website
//- once a user make payment on an email will be send to the user mail for order made.
//- check your backend web server you will see this
// {
//   id: '<20220326093150.ef2f475b67664a0c@sandbox466cb213bc764ad1baf5ac96df1630dc.mailgun.org>',  message: 'Queued. Thank you.'
// }
//- push the code to local and  remote git
//- C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona5> git status
//- C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona5> git add .
//- C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona5> git commit -m "Send Email Order Receipt"
//- for remote git
//C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona5\backend> git push

//Rate and Review Products
//- open ProductScreen.js file scrol down right before the closing div tags create another div
//tags to handle Rate and Review Products
//- create reviewsRef at the top like this let reviewsRef = useRef();
//- open productModel.js file to implement reviewSchema and use it as review property inside
//product module
//- let checkout the result on the browser on the ProductScreen page
//- next is to display the content of product.reviews in <ListGroup> component like this
// <ListGroup>
//   {product.reviews.map((review) => (
//     <ListGroup.Item key={review._id}>
//       <strong>{review.name}</strong>
//       <Rating rating={review.rating} caption=""></Rating>
//       <p>{review.createdAt.substring(0, 10)}</p>
//       <p>{review.comment}</p>
//     </ListGroup.Item>
//   ))}
// </ListGroup>
//- let create a form to enter review on productscreen
//- add rating variable like this const [rating, setRating] = useState(0);
//- right before return selection implement submitHandler function
//- add REFRESH_PRODUCT, CREATE_REQUEST, CREATE_SUCCESS and CREATE_FAIL action type onto the
// reducer function
//- use loadingCreateReview in useReducer method.
//- if loadingCreateReview is true use it in the disable props of Submit button for review form and use it below the button as well.
//- open productRoutes.js to implement `/api/products/${product._id}/reviews` right after delete api
//- let checkout the result on the ProductScreen
//- push the code to local and  remote git
//- C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona5> git status
//- C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona5> git add .
//- C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona5> git commit -m "Rate and Review Products"
//- for remote git
//C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona5\backend> git push

//Upload Multiple Images for Products
//- open productModel.js file to add images array of string field
//- open productRoutes.js file to update put('/:id',) api with product.images array of string
//right after product.image property
//- open ProductEditScreen.js file add const [images, setImages] = useState([]); right after const [image, setImage] = useState('');
//- add setImages(data.images) onto useEffect() react hook method
//- add images onto submitHandler() function
//- edit uploadFileHandler to handle to image and images from this
// const uploadFileHandler = async (e) => {
//   const file = e.target.files[0];
//   const bodyFormData = new FormData();
//   bodyFormData.append('file', file);
//   try {
//     dispatch({ type: 'UPLOAD_REQUEST' });
//     const { data } = await axios.post('/api/upload', bodyFormData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//         authorization: `Bearer ${userInfo.token}`,
//       },
//     });
//     dispatch({ type: 'UPLOAD_SUCCESS' });
//     toast.success('Image uploaded successfully');
//     setImage(data.secure_url); //data.secure_url is image path fetched from cloudinary
//   } catch (err) {
//     toast.error(getError(err));
//     dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
//   }
// };
//to this
// const uploadFileHandler = async (e, forImages) => {
//   const file = e.target.files[0];
//   const bodyFormData = new FormData();
//   bodyFormData.append('file', file);
//   try {
//     dispatch({ type: 'UPLOAD_REQUEST' });
//     const { data } = await axios.post('/api/upload', bodyFormData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//         authorization: `Bearer ${userInfo.token}`,
//       },
//     });
//     dispatch({ type: 'UPLOAD_SUCCESS' });

//     if (forImages) {
//       setImages([...images, data.secure_url]);
//     } else {
//       setImage(data.secure_url); //data.secure_url is image path fetched from cloudinary
//     }
//     toast.success('Image uploaded successfully. Click update to apply it');
//   } catch (err) {
//     toast.error(getError(err));
//     dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
//   }
// };
//- change Upload File to Upload Image
//- right after Upload Image create new Form.Group boostrap component to handle images array of string
//- implement deleteFileHandler() function right before return selection
//- let checkout the result by click on Admin -> click on Products -> click on Edit button -> Upload Additional Image then its display on Additional Image input field and click on Update button
//- click on Edit button again to view the uploaded file name on the ProductEditScreen.
//- go back to HomeScreen click on the product will you not see the additional image uploaded
// display in the ProductScreen to fix this issue open ProductScreen
//- add const [selectedImage, setSelectedImage] = useState(''); right after comment in ProductScreen.js file
//- scroll download to <img className="img-large" src={product.image} alt={product.name} />
//- change the src props from src={product.image} to this src={selectedImage || product.image}
//- right after Price create thumbnail to display the additional products in ProductScreen
//- open index.css to style button.thumbnail class selector
//- let checkout the result on the ProductScreen
//- push the code to local and  remote git
//- C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona6> git status
//- C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona6> git add .
//- C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona6> git commit -m "Upload Multiple Images for Products"
//- for remote git
//C:\ComputerD\E-commerce like Amazon Reactjs2022\amazona6> git push

//
