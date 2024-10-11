import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";
import axiosClient from "../axios";
import {
  CreateCollectionType,
  MintCollectiblePayload,
  MintCollectibleResponse,
  User,
} from "../types";
import { getAccessToken } from "../auth";
import { CreateCollectibleType, CollectibleDataType, FeeRateAmount, CollectionData } from "../types";
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

export async function createOrder({ id, feeRate }: { id: string, feeRate: number }) {
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

export async function createMintCollection({ id }: { id: string}) {
  try {
    return axiosClient
      .post(`/api/v1/collections/${id}/mint`)
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
}: {
  address: string;
  signedMessage: string;
}) {
  console.log("🚀 ~ loginHandler ~ walletData:", address);
  return axiosClient
    .post(
      `/api/v1/users/login`,
      JSON.stringify({ address, signedMessage }),
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
    url: `/api/v1/orders/estimated-fee`,
    
    data,
  };

  const response = await axiosClient.request(config);
  return response.data.data;
}

export async function createCollectible({ data }: { data: CollectibleDataType }) {
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

export async function createCollectiblesToCollection({ images, id }: { images: File[], id: string }) {
  const formData = new FormData();
  
  images.forEach((file, index) => {
    formData.append(`images`, file);
    console.log(`Appending file: ${file.name}, size: ${file.size}, type: ${file.type}`);
  });

  console.log('FormData contents:');
  console.log('images:', formData.getAll('images'));

  const config: AxiosRequestConfig = {
    method: "post",
    url: `/api/v1/collections/${id}/collectibles`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  try {
    const response = await axiosClient.request(config);
    console.log('Server response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in createCollectiblesToCollection:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error response:', error.response.data);
    }
    throw error;
  }
}

export async function createCollectibleMint(orderId:string) {
  try {
    return axiosClient
      .post(`/api/v1/collectibles/mint`, {orderId})
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
