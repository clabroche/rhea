import Axios from 'axios'
import HttpError from './HTTPError'
const api =  Axios.create({
  baseURL: `${process.env.VUE_APP_SERVER_URL}:${process.env.VUE_APP_SERVER_PORT}`,
})

api.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  HttpError.next(error)
  return Promise.reject(error);
});

api.getImageURL = (image) => {
  return api.defaults.baseURL.toString() + `/images?url=${image}`
}

export default api