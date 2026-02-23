import axios from "../axios";

export const loginService = async (payload) => {
    return await axios.post("/login", payload);
};
