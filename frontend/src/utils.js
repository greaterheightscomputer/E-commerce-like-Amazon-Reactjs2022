export const getError = (error) => {
  return error.response && error.response.data.message
    ? error.response.data.message //error from backend
    : error.message; //general error message
};
