import axios from "axios";
import { BASE_URL } from "../config/api";

export const uploadImageService = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return await axios.post(`${BASE_URL}/upload/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const getImageUrl = (filename) => {
    if (!filename) return null;
    return `${BASE_URL}/images/${filename}`;
};
