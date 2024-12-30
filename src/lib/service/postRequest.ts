import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";
import axiosClient from "../axios";
import {
  CreateCollectionType,
  LaunchCollectionData,
  MintCollectibleDataType,
  MintCollectiblePayload,
  MintCollectibleResponse,
  MintFeeType,
  User,
  OrderType,
} from "../types";
import { getAccessToken } from "../auth";
import {
  CreateCollectibleType,
  CollectibleDataType,
  FeeRateAmount,
  CollectionData,
  MintDataType,
  InscriptionCollectible,
  LaunchParams,
  CreateLaunchParams,
} from "../types";
import { collectibleFormData, collectiontFormData } from "./formHelper";

export async function generateMessageHandler({ address }: { address: string }) {
  console.log("🚀 ~ loginHandler ~ walletData:", address);
  return axiosClient
    .post(`/api/v1/users/generate-message`, JSON.stringify({ address }))
    .then((response) => {
      // if(respo)
      return response.data;
    });
}

export async function createOrder({
  id,
  feeRate,
}: {
  id: string;
  feeRate: number;
}) {
  try {
    return axiosClient
      .post(`/api/v1/collections/${id}/create-order`, { feeRate })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function createMintCollection({
  collectionId,
  feeRate,
  txid,
  userLayerId,
  totalFileSize,
  totalCollectibleCount,
}: {
  collectionId: string;
  feeRate: number;
  txid: string;
  userLayerId: string;
  totalFileSize: number;
  totalCollectibleCount: number;
}) {
  try {
    return axiosClient
      .post(`/api/v1/orders`, {
        collectionId,
        feeRate,
        txid,
        userLayerId,
        totalFileSize,
        totalCollectibleCount,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function loginHandler({
  address,
  signedMessage,
  layerId,
  pubkey,
}: {
  address: string;
  signedMessage: string;
  layerId: string;
  pubkey?: string;
}) {
  console.log("🚀 ~ loginHandler ~ walletData:", address);
  return axiosClient
    .post(
      `/api/v1/users/login`,
      JSON.stringify({ address, signedMessage, layerId, pubkey }),
    )
    .then((response) => {
      return response.data;
    });
}

export async function loginWalletLink({
  address,
  signedMessage,
  layerId,
  pubkey,
}: {
  address: string;
  signedMessage: string;
  layerId: string;
  pubkey?: string;
}) {
  return axiosClient
    .post(
      `/api/v1/users/link-account`,
      JSON.stringify({ address, signedMessage, layerId, pubkey }),
    )
    .then((response) => {
      return response.data;
    });
}

export async function linkAccountToAnotherUser({
  address,
  signedMessage,
  layerId,
  pubkey,
}: {
  address: string;
  signedMessage: string;
  layerId: string;
  pubkey?: string;
}) {
  return axiosClient
    .post(
      `/api/v1/users/link-account-to-another-user`,
      JSON.stringify({ address, signedMessage, layerId, pubkey }),
    )
    .then((response) => {
      return response.data;
    });
}
export async function profileUpdateHandler({ userData }: { userData: User }) {
  try {
    return axiosClient
      .put(`/api/users/profile/edit`, JSON.stringify(userData))
      .then((response) => {
        return response.data.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function feeAmount({ data }: { data: FeeRateAmount }) {
  const formData = collectiontFormData(data);
  const config: AxiosRequestConfig = {
    method: "post",
    url: `/api/v1/layers/estimate-fee/`,

    data,
  };

  const response = await axiosClient.request(config);
  return response.data;
}

export async function createCollectible({
  data,
}: {
  data: CollectibleDataType;
}) {
  const formData = collectibleFormData(data);
  const config: AxiosRequestConfig = {
    method: "post",
    url: `/api/v1/collectibles/create-order`,

    data: formData,
  };

  const response = await axiosClient.request(config);
  return response.data;
}

export async function createCollection({ data }: { data: CollectionData }) {
  const formData = collectibleFormData(data);
  const config: AxiosRequestConfig = {
    method: "post",
    url: `/api/v1/collections`,

    data: formData,
  };

  const response = await axiosClient.request(config);
  return response.data;
}

export async function createMintCollectible({
  data,
}: {
  data: MintCollectibleDataType;
}) {
  console.log("Creating mint collectible with data:", data);
  const formData = new FormData();

  // // Input validation
  // if (!data.files || !Array.isArray(data.files) || data.files.length === 0) {
  //   throw new Error("Files are required");
  // }
  // Append files with explicit type checking
  data.file.forEach((file, index) => {
    if (file instanceof File) {
      formData.append(`file`, file);
      console.log(
        `Appending file ${index}: ${file.name}, size: ${file.size}, type: ${file.type}`,
      );
    } else {
      console.error(`Invalid file at index ${index}:`, file);
      throw new Error(`Invalid file object at index ${index}`);
    }
  });

  // Append other data with null checking and type conversion
  formData.append("collectionId", data.collectionId);
  // Handle txid specifically
  if (data.txid) {
    console.log("Appending txid:", data.txid);
    formData.append("txid", data.txid);
  } else {
    console.log("No txid provided");
    formData.append("txid", ""); // Ensure empty string is sent if no txid
  }
  // Handle feeRate with type conversion
  const feeRate = data.feeRate?.toString() || "1";
  formData.append("feeRate", feeRate);
  // formData.append("name", data.name);
  // formData.append("creator", data.creator);
  // formData.append("description", data.description);

  console.log("FormData contents:");
  // Use Array.from() to convert the iterator to an array
  Array.from(formData.keys()).forEach((key) => {
    console.log(key, formData.get(key));
  });

  const config: AxiosRequestConfig = {
    method: "post",
    url: `/api/v1/orders/collectible`,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  try {
    const response = await axiosClient.request(config);
    console.log("Server response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in createCollectiblesToCollection:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Server error response:", error.response.data);
    }
    throw error;
  }
}

export async function createCollectiblesToCollection({
  data,
}: {
  data: MintDataType;
}) {
  const formData = new FormData();

  // Append files
  data.files.forEach((file, index) => {
    formData.append(`files`, file);
    console.log(
      `Appending file: ${file.name}, size: ${file.size}, type: ${file.type}`,
    );
  });

  // Append other data
  formData.append("orderType", data.orderType);
  formData.append("collectionId", data.collectionId);
  formData.append("feeRate", data.feeRate.toString());
  formData.append("totalFileCount", data.totalFileCount.toString());
  formData.append("txid", data.txid || "");

  console.log("FormData contents:");
  // Use Array.from() to convert the iterator to an array
  Array.from(formData.keys()).forEach((key) => {
    console.log(key, formData.get(key));
  });

  const config: AxiosRequestConfig = {
    method: "post",
    url: `/api/v1/orders/collection`,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  try {
    const response = await axiosClient.request(config);
    console.log("Server response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in createCollectiblesToCollection:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Server error response:", error.response.data);
    }
    throw error;
  }
}

export async function insriptionCollectible({
  data,
}: {
  data: InscriptionCollectible;
}) {
  const formData = new FormData();

  // Append files
  data.files.forEach((file, index) => {
    formData.append(`files`, file);
    console.log(
      `Appending file: ${file.name}, size: ${file.size}, type: ${file.type}`,
    );
  });

  const namesArray = data.names;
  formData.append("names", JSON.stringify(namesArray));

  // Append other data
  formData.append("collectionId", data.collectionId);

  console.log("FormData contents:");
  // Use Array.from() to convert the iterator to an array
  Array.from(formData.keys()).forEach((key) => {
    console.log(key, formData.get(key));
  });

  const config: AxiosRequestConfig = {
    method: "post",
    url: `/api/v1/collectibles/inscription`,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  try {
    const response = await axiosClient.request(config);
    console.log("Server response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in createCollectiblesToCollection:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Server error response:", error.response.data);
    }
    throw error;
  }
}

export async function createLaunchItems({
  data,
}: {
  data: CreateLaunchParams;
}) {
  const formData = new FormData();

  // Append files
  data.files.forEach((file, index) => {
    formData.append(`files`, file);
    console.log(
      `Appending file: ${file.name}, size: ${file.size}, type: ${file.type}`,
    );
  });

  const namesArray = data.names;
  formData.append("names", JSON.stringify(namesArray));

  // Append other data
  formData.append("collectionId", data.collectionId);
  formData.append("isLastBatch", data.isLastBatch.toString());

  console.log("FormData contents:");
  // Use Array.from() to convert the iterator to an array
  Array.from(formData.keys()).forEach((key) => {
    console.log(key, formData.get(key));
  });

  const config: AxiosRequestConfig = {
    method: "post",
    url: `/api/v1/launchpad/inscription`,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  try {
    const response = await axiosClient.request(config);
    console.log("Server response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in createCollectiblesToCollection:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Server error response:", error.response.data);
    }
    throw error;
  }
}

export async function launchCollection({
  data,
  collectionId,
}: {
  data: LaunchCollectionData;
  collectionId: string;
}) {
  const formData = new FormData();

  // Append files
  data.files.forEach((file, index) => {
    formData.append(`files`, file);
    console.log(
      `Appending file: ${file.name}, size: ${file.size}, type: ${file.type}`,
    );
  });

  // Append other data
  formData.append("POStartsAt", data.POStartsAt.toString());
  formData.append("POEndsAt", data.POEndsAt.toString());
  formData.append("POMintPrice", data.POMintPrice.toString());
  formData.append("POMaxMintPerWallet", data.POMaxMintPerWallet.toString());
  formData.append("isWhiteListed", data.isWhiteListed.toString());
  formData.append("totalFileCount", data.totalFileCount.toString());
  formData.append("txid", data.txid || "");

  console.log("FormData contents:");
  // Use Array.from() to convert the iterator to an array
  Array.from(formData.keys()).forEach((key) => {
    console.log(key, formData.get(key));
  });

  const config: AxiosRequestConfig = {
    method: "post",
    url: `/api/v1/collections/${collectionId}/launch`,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  try {
    const response = await axiosClient.request(config);
    console.log("Server response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in launch:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Server error response:", error.response.data);
    }
    throw error;
  }
}

export async function createCollectibleMint(orderId: string) {
  try {
    return axiosClient
      .post(`/api/v1/collectibles/mint`, { orderId })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function createOrderToMint({
  collectionId,
  feeRate,
  launchOfferType,
  txid,
}: {
  collectionId: string;
  feeRate: number;
  launchOfferType: string;
  txid?: string;
}) {
  try {
    return axiosClient
      .post(`/api/v1/launchpad/collections/${collectionId}/create-order`, {
        feeRate,
        launchOfferType,
        txid,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function createBuyLaunch({
  id,
  userLayerId,
  feeRate,
}: {
  id: string;
  userLayerId: string;
  feeRate: number;
}) {
  try {
    return axiosClient
      .post(`/api/v1/launchpad/${id}/buy`, { userLayerId, feeRate })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}
export async function confirmOrder({
  orderId,
  txid,
  launchItemId,
  userLayerId,
  feeRate,
}: {
  orderId: string;
  txid?: string | undefined;
  launchItemId: string;
  userLayerId: string;
  feeRate: number;
}) {
  try {
    return axiosClient
      .post(`/api/v1/launchpad/mint`, {
        orderId,
        txid,
        launchItemId,
        userLayerId,
        feeRate,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function createCollectionHandler({
  collectionData,
}: {
  collectionData: CreateCollectionType;
}): Promise<any> {
  console.log("🚀 ~ collectionData:", collectionData);

  try {
    const formData = new FormData();

    // Check if the logo property is an object with a 'file' property
    if (collectionData.logo && collectionData.logo.file) {
      try {
        const fileBlob = new Blob([collectionData.logo.file], {
          type: collectionData.logo.file.type,
        });
        console.log("🚀 ~ fileBlob created:", fileBlob);
        console.log("Blob size:", fileBlob.size);

        // Append the Blob to the FormData
        formData.append("logo", fileBlob);
        console.log("Logo appended to FormData");
      } catch (blobError) {
        console.error("Error creating Blob:", blobError);
      }
    } else {
      console.log("No logo file found in collectionData");
    }

    // Append other data fields
    formData.append("name", collectionData.name);
    formData.append("description", collectionData.description);
    formData.append("ticker", collectionData.ticker);
    formData.append("supply", collectionData.supply.toString());
    formData.append("price", collectionData.price.toString());
    formData.append("walletLimit", collectionData.walletLimit.toString());
    formData.append("POStartDate", collectionData.POStartDate.toString());

    console.log("🚀 ~ formData:", formData);

    const token = getAccessToken();
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "/api/v1/collections",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "multipart/form-data",
      },
      data: formData,
    };

    const response: AxiosResponse<any> = await axiosClient.request(config);
    console.log("🚀 ~ response:", response);

    // Check if the response has a 'data' property
    if (response.data) {
      return response.data;
    } else {
      // If the response doesn't have a 'data' property, return the entire response
      return response;
    }
  } catch (error) {
    console.error("Error creating collection:", error);

    // Check if the error is an instance of AxiosError
    if (error instanceof AxiosError) {
      // Handle the error response
      const { response } = error;
      if (response) {
        const { data, status, statusText } = response;
        console.log(`Error: ${status} ${statusText}`);
        console.log("Response data:", data);
      } else {
        console.log("Error:", error.message);
      }
    } else {
      // Handle other types of errors
      console.log("Error:", error);
    }

    throw error;
  }
}

export async function createCollectibleHandler({
  collectionData,
  collectionId,
}: {
  collectionData: CreateCollectibleType[];
  collectionId: string;
}): Promise<any> {
  try {
    const formData = new FormData();

    // Loop through the collectionData array
    for (let i = 0; i < collectionData.length; i++) {
      const data = collectionData[i];
      console.log("🚀 ~ data.file:", data.file);

      // Convert the File object to a Blob
      const fileBlob = new Blob([data.file], { type: data.file.type });
      console.log("🚀 ~ fileBlob:", fileBlob);

      // Append the Blob to the FormData
      formData.append("images", fileBlob, data.file.name);
    }

    const data = collectionData.map((collectible) => {
      return {
        name: collectible.meta.name,
        collectionId: collectionId,
      };
    });

    // Append JSON data to the form data
    formData.append("data", JSON.stringify(data));

    const token = getAccessToken();
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "/api/v1/collectibles",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "multipart/form-data",
        // ...formData.,
      },
      data: formData,
    };
    console.log("🚀 ~ config:", config);

    const response: AxiosResponse<any> = await axiosClient.request(config);
    console.log("🚀 ~ response:", response);

    // Check if the response has a 'data' property
    if (response.data) {
      return response.data;
    } else {
      // If the response doesn't have a 'data' property, return the entire response
      return response;
    }
  } catch (error) {
    console.error("Error creating collectible:", error);
    if (axios.isAxiosError(error)) {
      const { response } = error;
      const { ...errorObject } = response;
      console.log(errorObject);
      throw error;
    } else {
      console.error("Error creating collectible:", error);
    }
  }
}

export async function generateHex(collectionId: string) {
  // console.log("🚀 ~ loginHandler ~ walletData:", walletData);
  // try {
  return axiosClient
    .post(
      `/api/v1/purchase/${collectionId}/generate`,
      // JSON.stringify({ walletAddress: walletData }),
    )
    .then((response) => {
      // if(respo)
      return response.data;
    });
  // } catch (error) {
  //   throw new Error(error);
  // }
}
export async function createPurchase({
  buyerId,
  collectibleId,
  transactionId,
}: {
  collectibleId: string;
  transactionId: string;
  buyerId: string;
}) {
  // try {
  return axiosClient
    .post(
      `/api/v1/purchase`,
      JSON.stringify({ buyerId, collectibleId, transactionId }),
    )
    .then((response) => {
      if (response.data.success) {
        return response.data.data;
      } else {
        return response.data;
      }
    });
  // } catch (error) {
  //   throw new Error(error);
  // }
}

// Mint Collectible Handler
export const mintCollectibleHandler = async (
  payload: MintCollectiblePayload,
): Promise<MintCollectibleResponse> => {
  try {
    const response = await axiosClient.post<MintCollectibleResponse>(
      "/api/v1/collectibles/mint",
      payload,
    );

    if (!response.data.success) {
      throw new Error("Failed to mint collectible");
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to mint collectible",
      );
    }
    throw error;
  }
};

export async function listCollectibleConfirm({
  collectibleId,
  price,
}: {
  collectibleId: string;
  price: number;
}) {
  try {
    return axiosClient
      .post(`/api/v1/lists`, {
        collectibleId,
        price,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function mintFeeOfCitrea({ data }: { data: MintFeeType }) {
  try {
    return axiosClient
      .post(`/api/v1/launchpad/change-mintfee-transaction`, {
        data,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function generateBuyHexCitrea({ id }: { id: string }) {
  try {
    return axiosClient
      .post(`/api/v1/launchpad/${id}/generate-citrea-buy`, {
        id,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function createApprovalTransaction({
  collectionId,
  userLayerId,
}: {
  collectionId: string | undefined;
  userLayerId: string;
}) {
  try {
    return axiosClient
      .post(`/api/v1/lists/approval`, {
        collectionId,
        userLayerId,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function checkAndCreateRegister({
  collectionId,
  userLayerId,
}: {
  collectionId: string | undefined;
  userLayerId: string;
}) {
  try {
    return axiosClient
      .post(`/api/v1/lists/checkRegistration`, {
        collectionId,
        userLayerId,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function listCollectiblesForConfirm({
  collectibleId,
  price,
  txid,
}: {
  collectibleId: string;
  price: number;
  txid: string;
}) {
  try {
    return axiosClient
      .post(`/api/v1/lists`, {
        collectibleId,
        price,
        txid,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function confirmPendingList({
  id,
  txid,
  vout,
  inscribedAmount,
}: {
  id: string;
  txid: string;
  vout: number;
  inscribedAmount: number;
}) {
  try {
    return axiosClient
      .post(`/api/v1/lists/${id}/confirm`, {
        txid,
        vout,
        inscribedAmount,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function generateBuyHex({
  id,
  feeRate,
  userLayerId,
}: {
  id: string | null;
  feeRate: number;
  userLayerId: string;
}) {
  try {
    return axiosClient
      .post(`/api/v1/lists/${id}/generate-hex`, {
        feeRate,
        userLayerId,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function buyListedCollectible({
  id,
  txid,
  userLayerId,
}: {
  id: string | null;
  txid: string;
  userLayerId: string;
}) {
  try {
    return axiosClient
      .post(`/api/v1/lists/${id}/buy`, {
        txid,
        userLayerId,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function createMintHexCollection({
  orderId,
}: {
  orderId: string;
}) {
  try {
    return axiosClient
      .post(`/api/v1/orders/collection/hex`, {
        orderId,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function invokeOrderMint({ id }: { id: string }) {
  console.log("last id ", id);
  try {
    return axiosClient
      .post(`/api/v1/orders/${id}/invoke-mint`)
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function createLaunch({
  data,
  txid,
  totalFileSize,
  feeRate,
}: {
  data: LaunchParams;
  txid: string;
  totalFileSize: number;
  feeRate: number;
}) {
  try {
    return axiosClient
      .post(`/api/v1/launchpad`, { data, txid, totalFileSize, feeRate })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}
