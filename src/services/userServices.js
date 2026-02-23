import axios from "axios";
import { BASE_URL } from "../config/api";

export const getUserService = async (id) => {
    return await axios.get(`${BASE_URL}/user`, { params: { id } });
};

export const updateUserService = async (payload) => {
    return await axios.put(`${BASE_URL}/user`, payload);
};

export const deleteUserService = async (id) => {
    return await axios.delete(`${BASE_URL}/user`, { params: { id } });
};
