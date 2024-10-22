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

export async function fetchLaunchs(layerId: string) {
  return axiosClient
    .get(`/api/v1/launchpad?layerId=${layerId}&interval=all`)
    .then((response) => {
      if (response.data.success) {
        return response?.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}

export async function getLaunchByCollectionId(id: string){
  return axiosClient.get(`/api/v1/launchpad/collections/${id}`).then((response) => {
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

export async function getFeeRates(layerId: string) {
  return axiosClient
    .get(`/api/v1/layers/${layerId}/fee-rates`)
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
      `/api/v1/collectibles/${collectionId}/collection/listable`,
    )
    .then((response) => {
      if (response.data.success) {
        return response.data.data.collectibles;
      } else {
        throw new Error(response.data.error);
      }
    });
}

export async function getCollectionById(
  id: string
) {
  return axiosClient
    .get(
      `/api/v1/collectibles/${id}`,
    )
    .then((response) => {
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}

export async function getCollectibleById(
  id: string
) {
  return axiosClient
    .get(
      `/api/v1/collectible-traits/${id}/collectible`,
    )
    .then((response) => {
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
  }

  export async function getListableById(
    id: string
  ) {
    return axiosClient
      .get(
        `/api/v1/collectibles/${id}/listable?orderBy=recent`,
      )
      .then((response) => {
        if (response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data.error);
        }
      });
    }