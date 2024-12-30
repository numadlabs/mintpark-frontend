"use client";
import { TokenType, WalletStorage } from "@/types";
import { STORAGE_KEYS } from "./constants";

export function saveToken(tokenData: TokenType) {
  setAccessToken(tokenData.accessToken);
  setRefreshToken(tokenData.refreshToken);
}

export function setAccessToken(token: string) {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
}

export function setRefreshToken(token: string) {
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
}

export function getAccessToken() {
  if (!window) return null;

  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken() {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
}
