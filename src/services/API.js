import Axios from 'axios'
export default Axios.create({
  baseURL: `${process.env.VUE_APP_SERVER_URL}:${process.env.VUE_APP_SERVER_PORT}`
})