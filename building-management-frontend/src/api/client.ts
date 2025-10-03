import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5287/api",
  withCredentials: true, // CORS policy ile uyumlu
});

export default api;