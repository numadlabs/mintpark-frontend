//lib/axios.ts
"use client";

import axios from "axios";
import { configure } from "axios-hooks";
import { LRUCache } from "lru-cache";
import { clearToken, getAccessToken, getRefreshToken, saveToken } from "./auth";
import { toast } from "sonner";

export const BACKEND_URL =
  process.env.NODE_ENV === "development"
    // ? "http://localhost:3001" // development api
    ? "https://mintpark-staging-e569c5c4d83c.herokuapp.com/" // development api
    : "https://mintpark-production-0006d54da9fb.herokuapp.com";

const instance = axios.create({
  baseURL: BACKEND_URL,
});

export const initializeAxios = (logoutHandler: () => void) => {
  instance.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers["Authorization"] = "Bearer " + token;
      }

      // Only set multipart/form-data when data is actually FormData
      if (config.data instanceof FormData) {
        config.headers["Content-Type"] = "multipart/form-data";
      } else if (config.data) {
        // Only set application/json when there's actual data
        config.headers["Content-Type"] = "application/json";
      }
      // Don't set Content-Type for GET requests or requests without data

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async function (error) {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const res = await axios.post(
            `${BACKEND_URL}/api/v1/users/refreshToken`,
            {
              refreshToken: getRefreshToken(),
            }
          );

          if (res.status === 200) {
            saveToken(res.data.data);
            return instance(originalRequest);
          } else {
            handleLogout(logoutHandler);
            return Promise.reject(error);
          }
        } catch (refreshError) {
          handleLogout(logoutHandler);
          return Promise.reject(error);
        }
      }

      return error.response;
    }
  );
};
const cache = new LRUCache({ max: 10 });

const handleLogout = (logoutHandler: () => void) => {
  clearToken();
  logoutHandler();
  toast.error("Session expired. Please reconnect your wallet.");
};

configure({ axios: instance, cache });
export default instance;
