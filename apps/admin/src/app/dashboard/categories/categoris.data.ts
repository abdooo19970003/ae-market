import api from "@/lib/api";
import { toSnakeCase } from "@/lib/string";
import { da } from "zod/v4/locales";


export const getAllCategories = async (params: Record<string, any> = {}) => {
  params = { ...params, sort: `categories.${toSnakeCase(params.sort)}` }
  const { data } = await api.get("/categories", {
    params: { ...params, tree: "false" }
  });

  return data.data;
}

export const getCategoryById = async (id: string) => {
  const { data } = await api.get(`/categories/${id}`)
  return data.data
}

export const getCategoryChildren = async (id: string) => {
  const { data } = await api.get(`/categories/${id}/children`)
  return data.data
}

export const getCategoryProducts = async (id: string) => {
  const { data } = await api.get(`/categories/${id}/products?includeSubcategories=true`)
  return data.data
}