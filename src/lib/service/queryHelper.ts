import axiosClient from "../axios";
import {
  Collection,
  CollectionApiResponse,
  CollectionDetail,
  CollectionDetailApiResponse,
  Collectible,
  CollectibleApiResponse,
} from "../validations/collection-validation";
import { Launchschema } from "../validations/launchpad-validation";
import {
  LayerSchema,
  CurrentLayerSchema,
} from "../validations/layer-validation";
import { OrderSchema } from "../validations/asset-validation";
import { AssetSchema, ActivitySchema } from "../validations/asset-validation";
import { UserSchema } from "../validations/user-schema";

export async function getUserById(id: string) {
  return axiosClient.get(`/api/v1/users/${id}/userLayer`).then((response) => {
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error);
    }
  });
}

export async function getAllOrders(id: string): Promise<OrderSchema> {
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

export async function fetchLaunchs(
  layerId: string,
  interval: string
): Promise<Launchschema[]> {
  return axiosClient
    .get(`/api/v1/launchpad?layerId=${layerId}&interval=${interval}`)
    .then((response) => {
      if (response.data.success) {
        return response?.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}

export async function getLaunchById(collectionId: string) {
  return axiosClient
    .get(`/api/v1/launchpad/collections/${collectionId}`)
    .then((response) => {
      if (response.data.success) {
        return response?.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}

export async function getLaunchByCollectionId(id: string) {
  return axiosClient
    .get(`/api/v1/launchpad/collections/${id}`)
    .then((response) => {
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

export async function getAllLayers(): Promise<LayerSchema[]> {
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
  interval: string,
  orderBy: string,
  orderDirection: string
): Promise<Collection[]> {
  return axiosClient
    .get<CollectionApiResponse>(
      `/api/v1/collections/listed?layerId=${layerId}&interval=${interval}&orderBy=${orderBy}&orderDirection=${orderDirection}`
    )
    .then((response) => {
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch listed collections"
        );
      }
    });
}

export async function getListedCollectionById(
  collectionId: string
): Promise<CollectionDetail | null> {
  return axiosClient
    .get<CollectionDetailApiResponse>(
      `/api/v1/collectibles/${collectionId}/collection/listable`
    )
    .then((response) => {
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    });
}

export async function getCollectionById(
  id: string
): Promise<Collectible[] | null> {
  return axiosClient.get(`/api/v1/collectibles/${id}`).then((response) => {
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  });
}

export async function getCollectibleById(id: string) {
  return axiosClient
    .get(`/api/v1/collectibles/${id}/collection/listable`)
    .then((response) => {
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}

export async function getCollectionsById(id: string) {
  return axiosClient.get(`/api/v1/collections/${id}`).then((response) => {
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error);
    }
  });
}

export async function getListableById(
  id: string,
  orderDirection: string,
  orderBy: string,
  userLayerId: string
): Promise<AssetSchema> {
  return axiosClient
    .get(
      `/api/v1/collectibles/${id}/listable?orderDirection=${orderDirection}&orderBy=${orderBy}&userLayerId=${userLayerId}`
    )
    .then((response) => {
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}

export async function checkOrderStatus(id: string, txid?: string) {
  return axiosClient
    .get(`/api/v1/orders/${id}/payment-status?txid=${txid}`)
    .then((response) => {
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}

export async function getEstimateFee(id: string) {
  return axiosClient
    .get(`/api/v1/lists/${id}/estimate-fee`)
    .then((response) => {
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}

export async function getCollectibleActivity(
  id: string
): Promise<ActivitySchema[]> {
  return axiosClient
    .get(`/api/v1/collectibles/${id}/activity`)
    .then((response) => {
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}
