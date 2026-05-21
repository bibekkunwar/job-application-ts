import { BASE_URL } from "./config";

export const login = async (email: string, password: string) => {
  try {
    const resposne = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await resposne.json();

    return data;
  } catch (error) {
    console.error("login Failed", error);
    throw error;
  }
};

export const register = async (email: string, password: string) => {
  try {
    const resposne = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await resposne.json();

    return data;
  } catch (error) {
    console.error("failed to register", error);
    throw error;
  }
};
