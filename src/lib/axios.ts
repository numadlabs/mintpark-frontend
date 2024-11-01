"use client";

import axios from "axios";
import { configure } from "axios-hooks";
import { LRUCache } from "lru-cache";
import { clearToken, getAccessToken, getRefreshToken, saveToken } from "./auth";

export const BACKEND_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000" // development api
    : "https://mintpark-production-0006d54da9fb.herokuapp.com";

const instance = axios.create({
  baseURL: BACKEND_URL,
});

instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    // Set the correct Content-Type based on the request data
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  function (error) {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      axios
        .post(`${BACKEND_URL}/api/v1/users/refreshToken`, {
          refreshToken: getRefreshToken(),
        })
        .then(async (res) => {
          if (res.status === 200) {
            saveToken(res.data.data);
            return instance(originalRequest);
          } else {
            clearToken();
          }
        })
        .catch((error) => {});
    }

    // return Promise.reject(error);
    return error.response;
  },
);

const cache = new LRUCache({ max: 10 });

configure({ axios: instance, cache });
export default instance;
