import axiosClient from "../axios";
import {
  Collection,
  CollectionApiResponse,
  CollectionDetail,
  CollectionDetailApiResponse,
  Collectible,
  CreatorCollection,
  CheckPaymentProcess,
  InscriptionProgress,
  LaunchCreaterToolData,
} from "../validations/collection-validation";
import { Launchschema } from "../validations/launchpad-validation";
import { OrderSchema } from "../validations/asset-validation";
import { AssetSchema, ActivitySchema } from "../validations/asset-validation";
import { ActivityType } from "../types";
import { Layer } from "../types/wallet";

// export const checkPaymentStatus = async (
//   orderId: string
// ): Promise<CheckPaymentProcess> => {
//   return axiosClient
//     .get(`/api/v1/orders/${orderId}/check-paid`)
//     .then((response) => {
//       if (response.data.success) {
//         return response.data;
//       } else {
//         throw new Error(
//           response.data.error ||
//             response.data.message ||
//             "Failed to check payment status"
//         );
//       }
//     })
//     .catch((error) => {
//       console.error("Error checking payment status:", error);
//       throw error;
//     });
// };

//inscription progress done

export const checkPaymentStatus = async (
  orderId: string
): Promise<CheckPaymentProcess> => {
  return axiosClient
    .get(`/api/v1/orders/${orderId}/check-paid`)
    .then((response) => {
      if (response.data.success) {
        return response.data;
      } else {
        const errorMessage = response.data.error || 
                           response.data.message || 
                           "Failed to check payment status";
        throw new Error(errorMessage);
      }
    })
    .catch((error) => {
      console.error("Error checking payment status:", error);
      
      // If it's an axios error, extract the response error message
      if (error.response?.data) {
        const serverError = error.response.data.error || 
                           error.response.data.message || 
                           `Server error: ${error.response.status}`;
        throw new Error(serverError);
      }
      
      // Re-throw the error to maintain the original error message
      throw error;
    });
};

export async function getInscriptionProgress({
  collectionId,
  userLayerId,
}: {
  collectionId: string;
  userLayerId?: string;
}): Promise<InscriptionProgress> {
  const url = `/api/v1/collections/${collectionId}/inscription-progress?userLayerId=${userLayerId}`;

  return axiosClient.get(url).then((response) => {
    if (response.data.success) {
      return response.data.data as InscriptionProgress;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch inscription progress"
      );
    }
  });
}

// new creater tool api

export async function createrCollection(
  userLayerId: string,
  page: number = 1,
  limit: number = 10
): Promise<CreatorCollection[]> {
  const params = new URLSearchParams({
    userLayerId,
    page: page.toString(),
    limit: limit.toString(),
  });

  return axiosClient
    .get(`/api/v1/collections/creator-owned?${params.toString()}`)
    .then((response) => {
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch creator collections"
        );
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

//call to launch details api
export async function getLaunchByDetailCreaterTool(
  id: string
): Promise<LaunchCreaterToolData | null> {
  return axiosClient
    .get(`/api/v1/launchpad/${id}/collection`)
    .then((response) => {
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return null;
      }
    })
    .catch((error) => {
      console.error("Failed to fetch launch data:", error);
      return null;
    });
}

export async function getById(id: string) {
  return axiosClient.get(`/api/v1/collections/${id}`).then((response) => {
    if (response.data.success) {
      return response?.data.data;
    } else {
      throw new Error(response.data.error);
    }
  });
}

export async function getAllLayers(): Promise<Layer[]> {
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
  collectionId: string,
  orderBy: string,
  orderDirection: string,
  limit: number,
  offset: number,
  query: string,
  isListed: boolean,
  traitValuesByType: Record<string, string[]> | string // Update type to handle both
): Promise<CollectionDetail | null> {
  const params = new URLSearchParams({
    orderBy,
    orderDirection,
    limit: limit.toString(),
    offset: offset.toString(),
    query: query.toString(),
  });

  if (traitValuesByType) {
    // If it's already a string (backwards compatibility), use it directly
    // Otherwise, stringify it once here
    const traitValuesParam =
      typeof traitValuesByType === "string"
        ? traitValuesByType
        : JSON.stringify(traitValuesByType);

    params.append("traitValuesByType", traitValuesParam);
  }

  return axiosClient
    .get<CollectionDetailApiResponse>(
      `/api/v1/collectibles/${collectionId}/collection/listable?${params.toString()}&isListed=${isListed}`
    )
    .then((response) => {
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    });
}

export async function getAssetById(id: string): Promise<Collectible | null> {
  return axiosClient.get(`/api/v1/collectibles/${id}`).then((response) => {
    console.log(response.data.data);
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  });
}

export async function getListableById(
  id: string,
  orderDirection: string,
  orderBy: string,
  userLayerId: string,
  limit: number,
  offset: number,
  collectionIds: string[],
  availability: string
): Promise<AssetSchema> {
  // Create base query parameters
  const params = new URLSearchParams({
    orderDirection,
    orderBy,
    userLayerId,
    limit: limit.toString(),
    offset: offset.toString(),
    // isListed: availability.toString(),
  });

  // Add collectionIds as a single parameter if array is not empty
  if (collectionIds.length > 0) {
    params.append("collectionIds", JSON.stringify(collectionIds));
  }

  // Only add isListed parameter if availability is "isListed"
  if (availability === "isListed") {
    params.append("isListed", "true");
  } else if (availability === "notListed") {
    params.append("isListed", "false");
  }

  return axiosClient
    .get(`/api/v1/collectibles/${id}/listable?${params.toString()}`)
    .then((response) => {
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.error);
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

// // Updated getCollectionActivity function with pagination
// export async function getCollectionActivity(
//   id: string,
//   limit: number = 20,
//   offset: number = 0,
//   activityType?: string
// ): Promise<ActivitySchema[]> {
//   const params = new URLSearchParams({
//     limit: limit.toString(),
//     offset: offset.toString(),
//   });

//   // Only add activityType param if it's defined and not "ALL"
//   if (activityType && activityType !== "ALL") {
//     params.append("activityType", activityType);
//   }

//   console.log("API Call params:", params.toString()); // Debug log
//   console.log("Activity Type:", activityType); // Debug log

//   return axiosClient
//     .get(`/api/v1/collectibles/${id}/activity?${params.toString()}`)
//     .then((response) => {
//       if (response.data.success) {
//         return response.data.data.activities.map((activity: any) => ({
//           activityType: activity.event,
//           tokenId: activity.item.tokenId,
//           contractAddress: activity.item.contractAddress,
//           collectibleId: activity.item.collectibleId,
//           fileKey: activity.item.fileKey,
//           name: activity.item.name,
//           fromAddress: activity.from || "Unknown",
//           toAddress: activity.to || undefined,
//           price: activity.price,
//           transactionHash: activity.transactionHash,
//           timestamp: activity.time,
//           blockNumber: 0,
//         }));
//       } else {
//         throw new Error(response.data.error);
//       }
//     });
// }

export async function getCollectionActivity(
  id: string,
  limit: number = 20,
  offset: number = 0,
  activityType?: string
): Promise<ActivitySchema[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (activityType && activityType !== "ALL") {
    params.append("activityType", activityType);
  }

  const finalUrl = `/api/v1/collectibles/${id}/activity?${params.toString()}`;

  return axiosClient.get(finalUrl).then((response) => {
    if (response.data.success) {
      return response.data.data.activities.map((activity: any) => ({
        activityType: activity.event,
        tokenId: activity.item.tokenId,
        contractAddress: activity.item.contractAddress,
        collectibleId: activity.item.collectibleId,
        fileKey: activity.item.fileKey,
        name: activity.item.name,
        fromAddress: activity.from || "Unknown",
        toAddress: activity.to || undefined,
        price: activity.price,
        transactionHash: activity.transactionHash,
        timestamp: activity.time,
        blockNumber: 0,
      }));
    } else {
      throw new Error(response.data.error);
    }
  });
}

// getCollectibleActivity function with pagination
export async function getCollectibleActivity(
  id: string,
  limit: number = 20,
  offset: number = 0
): Promise<ActivityType[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  return axiosClient
    .get(`/api/v1/collectibles/collectible/${id}/activity?${params.toString()}`)
    .then((response) => {
      if (response.data.success) {
        return response.data.data.activities.map((activity: any) => ({
          activityType: activity.type || "",
          tokenId: activity.tokenId || null,
          collectionId: id, // Using passed collection ID since it's not in response
          fromAddress: activity.from || "",
          toAddress: activity.to || "", // Only populated for certain activity types
          price: activity.price || "0",
          transactionHash: activity.transactionHash || "",
          timestamp: Number(activity.timestamp) || 0,
          blockNumber: Number(activity.blockNumber) || 0,
          seller: activity.seller || "Unknown",
        }));
      } else {
        throw new Error(response.data.error);
      }
    });
}

// collection detail traits
export async function getCollectibleTraits(id: string) {
  return axiosClient
    .get(`/api/v1/collectible-traits/${id}/collectible`)
    .then((response) => {
      if (response.data.success) {
        return response.data.data.traits;
      } else {
        throw new Error(response.data.error);
      }
    });
}

// collection collectible trait types

export async function getCollectibleTraitTypes(id: string) {
  return axiosClient
    .get(`/api/v1/trait-types/${id}/collection`)
    .then((response) => {
      if (response.data.success) {
        return response.data.data.traitTypes;
      } else {
        throw new Error(response.data.error);
      }
    });
}
// collection collectible trait values

export async function getCollectibleTraitValues(id: string) {
  return axiosClient
    .get(`/api/v1/trait-values/${id}/trait-type`)
    .then((response) => {
      if (response.data.success) {
        return response.data.data.traitTypes;
      } else {
        throw new Error(response.data.error);
      }
    });
}
