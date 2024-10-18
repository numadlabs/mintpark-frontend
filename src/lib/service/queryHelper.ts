import axios from "axios";
import axiosClient from "../axios";
import { CollectionType } from "../types";

export async function getUserById(id: string) {
  return axiosClient.get(`/api/v1/users/${id}`).then((response) => {
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error);
    }
  });
}

export async function getAllOrders(id: string) {
  return axiosClient.get(`/api/v1/orders/user/${id}`).then((response) => {
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error);
    }
  });
}
export async function getOrderById(id: string) {
  return axiosClient.get(`/api/v1/orders/${id}`).then((response) => {
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error);
    }
  });
}

export async function fetchLaunchs(): Promise<CollectionType[]> {
  return axiosClient
    .get(`/api/v1/collections?layerType=BITCOIN_TESTNET`)
    .then((response) => {
      if (response.data.success) {
        return response?.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}

export async function fetcCollectionByCollectionId(
  id: string,
): Promise<CollectionType[]> {
  return axiosClient.get(`/api/v1/collections/${id}`).then((response) => {
    if (response.data.success) {
      return response?.data.data;
    } else {
      throw new Error(response.data.error);
    }
  });
}

export async function getFeeRatesByLayer() {
  return axiosClient
    .get(`/api/v1/orders/fee-rates/BITCOIN_TESTNET`)
    .then((response) => {
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}
export async function getAllLayers() {
  return axiosClient
    .get(`/api/v1/layers/`)
    .then((response) => {
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}

export async function getLayerById(id: string) {
  return axiosClient
    .get(`/api/v1/layers/${id}`)
    .then((response) => {
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
