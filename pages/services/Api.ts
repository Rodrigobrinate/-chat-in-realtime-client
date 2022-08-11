import axios from "axios";


let Api
export default  Api = axios.create({ 
        baseURL: "http://localhost:3001",
        //baseURL: "http://172.17.0.6:6868"
      });