import axios, { AxiosRequestConfig } from "axios";
import axiosClient from "../axios";
import {
  BadgeType,
  LaunchItemType,
  MintCollectibleDataType,
  MintFeeType,
} from "../types";
import {
  CollectionData,
  InscriptionCollectible,
  LaunchParams,
  CreateLaunchParams,
} from "../types";
import { collectibleFormData } from "./formHelper";

// Connect and Login sections
export async function generateMessageHandler({ address }: { address: string }) {
  try {
    // console.log("🚀 ~ loginHandler ~ walletData:", address);
    return axiosClient
      .post(`/api/v1/users/generate-message`, JSON.stringify({ address }))
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    } else {
      throw error;
    }
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
  try {
    // console.log("🚀 ~ loginHandler ~ walletData:", address);
    return axiosClient
      .post(
        `/api/v1/users/login`,
        JSON.stringify({ address, signedMessage, layerId, pubkey })
      )
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    } else {
      throw error;
    }
  }
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
  try {
    return axiosClient
      .post(
        `/api/v1/users/link-account`,
        JSON.stringify({ address, signedMessage, layerId, pubkey })
      )
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    } else {
      throw error;
    }
  }
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
  try {
    return axiosClient
      .post(
        `/api/v1/users/link-account-to-another-user`,
        JSON.stringify({ address, signedMessage, layerId, pubkey })
      )
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    } else {
      throw error;
    }
  }
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

export async function createBadgeCollection({ data }: { data: BadgeType }) {
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
  // console.log("Creating mint collectible with data:", data);
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
  const formData = new FormData();

  const dataLaunch = data;
  formData.append("data", JSON.stringify(dataLaunch));

  // Append other data
  formData.append("txid", txid);
  formData.append("totalFileSize", totalFileSize.toString());
  formData.append("feeRate", feeRate.toString());
  console.log("FormData contents:");
  // Use Array.from() to convert the iterator to an array
  Array.from(formData.keys()).forEach((key) => {
    console.log(key, formData.get(key));
  });

  const config: AxiosRequestConfig = {
    method: "post",
    url: `/api/v1/launchpad`,
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

export async function createBadgeLaunch({
  data,
  txid,
  badge,
  badgeSupply,
}: {
  data: LaunchParams;
  txid: string;
  badge?: File;
  badgeSupply?: number;
}) {
  const formData = new FormData();

  // Handle single file
  if (badge instanceof File) {
    formData.append("badge", badge);
    console.log(
      `Appending file: ${badge.name}, size: ${badge.size}, type: ${badge.type}`
    );
  } else if (badge) {
    console.error("Invalid file:", badge);
    throw new Error("Invalid file object provided");
  }

  const dataLaunch = data;
  formData.append("data", JSON.stringify(dataLaunch));

  // Append other data
  if (typeof badgeSupply !== "undefined") {
    formData.append("badgeSupply", badgeSupply.toString());
  }

  // Append other data
  formData.append("txid", txid);
  console.log("FormData contents:");
  // Use Array.from() to convert the iterator to an array
  Array.from(formData.keys()).forEach((key) => {
    console.log(key, formData.get(key));
  });

  const config: AxiosRequestConfig = {
    method: "post",
    url: `/api/v1/launchpad`,
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

export async function cancelList({ id }: { id: string }) {
  try {
    return axiosClient
      .post(`/api/v1/lists/${id}/generate-cancel-listing-tx`)
      .then((response) => {
        return response.data;
      });
  } catch (error: any) {
    console.log(error.message);
  }
}

export async function confirmCancelList({ id }: { id: string }) {
  try {
    return axiosClient
      .post(`/api/v1/lists/${id}/confirm-cancel-listing`)
      .then((response) => {
        return response.data;
      });
  } catch (error: any) {
    console.log(error.message);
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

export async function launchItems({ data }: { data: LaunchItemType }) {
  const formData = new FormData();

  // Append files if they exist
  if (data.files && data.files.length > 0) {
    data.files.forEach((file, index) => {
      formData.append("files", file);
      console.log(
        `Appending file: ${file.name}, size: ${file.size}, type: ${file.type}`
      );
    });
  }

  // Append other data
  formData.append("collectionId", data.collectionId);

  // Only append isLastBatch if it's defined
  if (typeof data.isLastBatch !== "undefined") {
    formData.append("isLastBatch", data.isLastBatch.toString());
  } else {
    // You might want to set a default value here
    formData.append("isLastBatch", "false");
  }

  console.log("FormData contents:");
  // Use Array.from() to convert the iterator to an array
  Array.from(formData.keys()).forEach((key) => {
    console.log(key, formData.get(key));
  });

  const config: AxiosRequestConfig = {
    method: "post",
    url: `/api/v1/launchpad/nft`,
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

export async function launchItemsIpfs({
  collectionId,
  isLastBatch,
}: {
  collectionId: string;
  isLastBatch?: boolean;
}) {
  const formData = new FormData();

  // Append other data
  formData.append("collectionId", collectionId);

  // Only append isLastBatch if it's defined
  if (typeof isLastBatch !== "undefined") {
    formData.append("isLastBatch", isLastBatch.toString());
  } else {
    // You might want to set a default value here
    formData.append("isLastBatch", "false");
  }

  console.log("FormData contents:");
  // Use Array.from() to convert the iterator to an array
  Array.from(formData.keys()).forEach((key) => {
    console.log(key, formData.get(key));
  });

  const config: AxiosRequestConfig = {
    method: "post",
    url: `/api/v1/launchpad/ipfs`,
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

export async function mintFeeOfCitrea({
  data,
  userLayerId,
}: {
  data: MintFeeType;
  userLayerId: string | null;
}) {
  try {
    return axiosClient
      .post(`/api/v1/launchpad/change-mintfee-transaction`, {
        data,
        userLayerId,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function whitelistAddresses({
  launchId,
  addresses,
}: {
  launchId: string;
  addresses: string[];
}) {
  try {
    return axiosClient
      .post(`/api/v1/launchpad/whitelist-addresses`, {
        launchId,
        addresses,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function ifpsLaunchItem({
  collectionId,
  isLastBatch,
}: {
  collectionId: string;
  isLastBatch?: boolean;
}) {
  try {
    return axiosClient
      .post(`/api/v1/launchpad/ipfs`, {
        collectionId,
        isLastBatch,
      })
      .then((response) => {
        return response.data;
      });
  } catch (error) {
    console.log("Error:", error);
  }
}
