import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Store } from '../Store';

//get children from the props which means components
export default function AdminRoute({ children }) {
  const { state } = useContext(Store);
  const { userInfo } = state;

  return userInfo && userInfo.isAdmin ? children : <Navigate to="/signin" />;
}
