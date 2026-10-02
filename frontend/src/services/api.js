import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});

let refreshRequest;

const clearSession = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const shouldRefresh =
            error.response?.status === 401 &&
            !originalRequest?._retry &&
            originalRequest?.url !== "token/refresh/";

        if (!shouldRefresh) {
            return Promise.reject(error);
        }

        const refreshToken = localStorage.getItem("refresh");

        if (!refreshToken) {
            clearSession();
            window.location.assign("/");
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshRequest) {
                refreshRequest = axios.post(
                    `${api.defaults.baseURL}token/refresh/`,
                    { refresh: refreshToken }
                );
            }

            const { data } = await refreshRequest;

            localStorage.setItem("access", data.access);

            originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${data.access}`,
            };

            return api(originalRequest);
        } catch (refreshError) {
            clearSession();
            window.location.assign("/");
            return Promise.reject(refreshError);
        } finally {
            refreshRequest = undefined;
        }
    }
);

export default api;
