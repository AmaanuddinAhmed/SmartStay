import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

export const errorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  (error.request
    ? "Can't reach the server. Check that the API Gateway is running on port 5000."
    : error.message);

export default api;
