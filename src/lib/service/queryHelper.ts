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
  return axiosClient.get(`/api/v1/layers/`).then((response) => {
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error);
    }
  });
}

export async function getLayerById(id: string) {
  return axiosClient.get(`/api/v1/layers/${id}`).then((response) => {
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error);
    }
  });
}

export async function getListedCollections(
  layerId: string,
  // interval: string,
  // orderBy: string,
  // orderDirection: string,
) {
  return axiosClient
    .get(
      `/api/v1/collections/listed?layerId=${layerId}&interval=all&orderBy=volume&orderDirection=highest`,
    )
    .then((response) => {
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}

export async function getListedCollectionById(
  collectionId: string,
) {
  return axiosClient
    .get(
      `/api/v1/collectibles/${collectionId}/collection/listable?traits[]=color:red&traits[]=background:black&orderBy=asdf`,
    )
    .then((response) => {
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}

export async function getCollectionById(
  // id: string
) {
  return axiosClient
    .get(
      `/api/v1/collectibles/e691bbe6-97df-4345-978d-bab10ff5727f`,
    )
    .then((response) => {
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}
