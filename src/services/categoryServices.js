import axios from "axios";
import { BASE_URL } from "../config/api";

export const getCategoriesService = async (id = "") => {
    return await axios.get(`${BASE_URL}/category`, { params: { id } });
};

export const createCategoryService = async (payload) => {
    return await axios.post(`${BASE_URL}/category`, payload);
};

export const updateCategoryService = async (payload) => {
    return await axios.put(`${BASE_URL}/category`, payload);
};

export const deleteCategoryService = async (id) => {
    return await axios.delete(`${BASE_URL}/category`, { params: { id } });
};
