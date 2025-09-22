import axios from "axios";
// username, email, dateBirth, password

export const api = axios.create({ baseURL: "https://server-network.onrender.com", })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
})

interface SignUpData {
  usernameInput: string;
  email: string;
  dateBirth: string;
  password: string;
}

export async function postSignUp(data: SignUpData) {
  return api.post("/signup", data);
}
export async function postLogin(email: string, password: string) {
  return api.post("/login", { email, password });
}

// logout (для JWT это просто удаляем токен на фронте)
export function getLogout() {
}

// export async function postSignUp(data: SignUpData): Promise<void> {
//   return axios.post("http://127.0.0.1:3000/signup", data);
// }

// export async function postLogin(email: string, password: string) {
//   return axios.post("http://127.0.0.1:3000/login", { email, password }, { withCredentials: true });
// }

// export async function getLogout() {
//   return axios.get("http://127.0.0.1:3000/logout", { withCredentials: true });
// }