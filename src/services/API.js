import Axios from 'axios'
import HttpError from './HTTPError'
const axios =  Axios.create({
  baseURL: `${process.env.VUE_APP_SERVER_URL}:${process.env.VUE_APP_SERVER_PORT}`,
})

axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  HttpError.next(error)
  return Promise.reject(error);
});

export default axios