import axios from "axios";
import { BASE_URL } from "../config/api";

export const getTransactionsService = async (userId, mode = "", startDate = "", endDate = "", today = "") => {
    return await axios.get(`${BASE_URL}/transaction`, {
        params: { userId, mode, startDate, endDate, today }
    });
};

export const getAllTransactionsService = async (id = "") => {
    const token = localStorage.getItem("token");
    return await axios.get(`${BASE_URL}/alltransaction`, {
        params: { id },
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const createTransactionService = async (payload) => {
    return await axios.post(`${BASE_URL}/transaction`, payload);
};

export const updateTransactionService = async (id, payload) => {
    return await axios.put(`${BASE_URL}/transaction`, payload, {
        params: { id }
    });
};

export const deleteTransactionService = async (id) => {
    return await axios.delete(`${BASE_URL}/transaction`, {
        params: { id }
    });
};
