import axios from "axios"

// Criando uma instância do axios com a URL base da API
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

export default api
