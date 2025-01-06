import axios, { AxiosRequestConfig } from "axios";
import axiosClient from "../axios";
import { MintCollectibleDataType } from "../types";
import {
  CollectionData,
  InscriptionCollectible,
  LaunchParams,
  CreateLaunchParams,
} from "../types";
import { collectibleFormData } from "./formHelper";

// Connect and Login sections
export async function generateMessageHandler({ address }: { address: string }) {
  console.log("🚀 ~ loginHandler ~ walletData:", address);
  return axiosClient
    .post(`/api/v1/users/generate-message`, JSON.stringify({ address }))
    .then((response) => {
      // if(respo)
      return response.data;
    });
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
      JSON.stringify({ address, signedMessage, layerId, pubkey })
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
      JSON.stringify({ address, signedMessage, layerId, pubkey })
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
      JSON.stringify({ address, signedMessage, layerId, pubkey })
    )
    .then((response) => {
      return response.data;
    });
}

//Collection section
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
  data.file.forEach((file, index) => {
    if (file instanceof File) {
      formData.append(`file`, file);
      console.log(
        `Appending file ${index}: ${file.name}, size: ${file.size}, type: ${file.type}`
      );
    } else {
      console.error(`Invalid file at index ${index}:`, file);
      throw new Error(`Invalid file object at index ${index}`);
    }
  });

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
      `Appending file: ${file.name}, size: ${file.size}, type: ${file.type}`
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

//Launch section
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
      `Appending file: ${file.name}, size: ${file.size}, type: ${file.type}`
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
