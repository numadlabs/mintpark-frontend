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
  export async function getOrderById() {
    return axiosClient
      .get(`/api/v1/orders/BITCOIN_TESTNET}`)
      .then((response) => {
        if (response.data.success) {
          return response.data.orders;
        } else {
          throw new Error(response.data.error);
        }
      });
  }