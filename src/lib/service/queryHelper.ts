import axios from "axios";
import axiosClient from "../axios";

export async function getUserById(address: string) {
    return axiosClient
      .get(`/api/v1/users/${address}`)
      .then((response) => {
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.error);
        }
      });
  }