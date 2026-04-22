"use server"

import { LoginInput } from "./login.utils"

const API = process.env.API_URL


export const login = async (input: LoginInput) => {
  try {
    console.log(API);

    const response = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
    const data = await response.json()
    console.log(data);

  } catch (error) {
    console.log(error);
  }
  console.log(input)
}