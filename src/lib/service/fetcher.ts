"use client";

import axios from "axios";
import axiosClient from "../axios";
import { CollectibleType, CollectionType } from "../types";

/**
 * Fetches unspent transaction outputs (UTXOs) for a given address.
 *
 * @param address - The Bitcoin address to fetch UTXOs for.
 * @returns A promise that resolves to an array of UTXOs.
 *
 * @throws Will throw an error if the request fails.
 */
export function fetchUtxos(address: string) {
  return axios.post("/api/utxo", { address }).then((response) => {
    return response.data.data;
  });
}

export function fetchTransactionHex(
  txId: string,
  verbose: boolean,
  blockHash: string | null,
) {
  return axios
    .post("/api/transactionHex", { txId, verbose, blockHash })
    .then((response) => {
      return response.data.data;
    });
}

export function fetchBlockHash(height: number) {
  return axios.post("/api/blockHash", { height }).then((response) => {
    return response.data.data;
  });
}

export function sendTransactionHelper(transactionHex: string) {
  return axios
    .post("/api/sendTransaction", { transactionHex })
    .then((response) => {
      return response.data.data;
    });
}

export async function fetchLaunchs(): Promise<CollectionType[]> {
  return axiosClient.get(`/api/v1/collections`).then((response) => {
    if (response.data.success) {
      return response?.data.data;
    } else {
      throw new Error(response.data.error);
    }
  });
}

// export async function fetchLaunchById(id: string): Promise<CollectionType> {
//   return axiosClient.get(`/api/v1/collections/${id}`).then((response) => {
//     if (response.data.success) {
//       return response?.data.data;
//     } else {
//       throw new Error(response.data.error);
//     }
//   });
// }

export async function fetcCollectionByCollectionId(
  id: string,
): Promise<CollectibleType[]> {
  return axiosClient
    .get(`/api/v1/collectibles/${id}/collections`)
    .then((response) => {
      if (response.data.success) {
        return response?.data.data;
      } else {
        throw new Error(response.data.error);
      }
    });
}
