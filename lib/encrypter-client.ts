"use client";

import CryptoJS from 'crypto-js';
import { sha3_512 } from 'js-sha3';

const CRY_PUBKEY = process.env.NEXT_PUBLIC_CRY_PUBKEY ?? '';
const CRY_SECRETKEY = process.env.NEXT_PUBLIC_CRY_SECRETKEY ?? '';

// ─── byte helpers ───

const wordArrayToUint8Array = (wordArray: CryptoJS.lib.WordArray): Uint8Array => {
  const { words, sigBytes } = wordArray;
  const uint8 = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    uint8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return uint8;
};

const base64ToUint8Array = (b64: string): Uint8Array => {
  const wordArray = CryptoJS.enc.Base64.parse(b64);
  return wordArrayToUint8Array(wordArray);
};

const uint8ArrayToWordArray = (uint8Array: Uint8Array): CryptoJS.lib.WordArray => {
  const words: number[] = [];
  for (let i = 0; i < uint8Array.length; i += 4) {
    words.push(
      ((uint8Array[i] ?? 0) << 24) |
      ((uint8Array[i + 1] ?? 0) << 16) |
      ((uint8Array[i + 2] ?? 0) << 8) |
      (uint8Array[i + 3] ?? 0),
    );
  }
  return CryptoJS.lib.WordArray.create(words, uint8Array.length);
};

// ─── HMAC-SHA3-512 ───

const hmacSha3_512 = (keyBytes: Uint8Array, messageBytes: Uint8Array): Uint8Array => {
  const BLOCK_SIZE = 72; // SHA3-512 rate = 576 bits = 72 bytes

  let key: Uint8Array =
    keyBytes.length > BLOCK_SIZE
      ? new Uint8Array(sha3_512.arrayBuffer(keyBytes))
      : keyBytes;

  const paddedKey = new Uint8Array(BLOCK_SIZE);
  paddedKey.set(key);

  const ipad = paddedKey.map((b) => b ^ 0x36);
  const opad = paddedKey.map((b) => b ^ 0x5c);

  const innerInput = new Uint8Array(ipad.length + messageBytes.length);
  innerInput.set(ipad, 0);
  innerInput.set(messageBytes, ipad.length);
  const innerHash = new Uint8Array(sha3_512.arrayBuffer(innerInput));

  const outerInput = new Uint8Array(opad.length + innerHash.length);
  outerInput.set(opad, 0);
  outerInput.set(innerHash, opad.length);

  return new Uint8Array(sha3_512.arrayBuffer(outerInput));
};

// ─── public API ───

export const securedEncrypt = (data: Record<string, unknown>): string => {
  if (!CRY_PUBKEY) throw new Error('CRY_PUBKEY is not defined.');
  if (!CRY_SECRETKEY) throw new Error('CRY_SECRETKEY is not defined.');

  const firstKeyBytes = base64ToUint8Array(CRY_PUBKEY).slice(0, 32);
  const secondKeyBytes = base64ToUint8Array(CRY_SECRETKEY);

  if (firstKeyBytes.length !== 32) {
    throw new Error(
      `CRY_PUBKEY invalid: expected 32 bytes, got ${firstKeyBytes.length} bytes. Base64 key harus 44 karakter.`,
    );
  }

  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), uint8ArrayToWordArray(firstKeyBytes), {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const ciphertextBytes = wordArrayToUint8Array(encrypted.ciphertext);
  const hmacBytes = hmacSha3_512(secondKeyBytes, ciphertextBytes);
  const ivBytes = wordArrayToUint8Array(iv);

  const mix = new Uint8Array(ivBytes.length + hmacBytes.length + ciphertextBytes.length);
  mix.set(ivBytes, 0);
  mix.set(hmacBytes, ivBytes.length);
  mix.set(ciphertextBytes, ivBytes.length + hmacBytes.length);

  return btoa(String.fromCharCode(...mix));
};

export const securedDecrypt = <T = Record<string, any>>(encryptedData: string): T | null => {
  if (!encryptedData || typeof encryptedData !== 'string') {
    console.error('[securedDecrypt] Invalid input: expected non-empty string.');
    return null;
  }

  if (!CRY_PUBKEY) throw new Error('CRY_PUBKEY is not defined.');
  if (!CRY_SECRETKEY) throw new Error('CRY_SECRETKEY is not defined.');

  const firstKeyBytes = base64ToUint8Array(CRY_PUBKEY).slice(0, 32);
  const secondKeyBytes = base64ToUint8Array(CRY_SECRETKEY);

  if (firstKeyBytes.length !== 32) {
    throw new Error(`CRY_PUBKEY invalid: expected 32 bytes, got ${firstKeyBytes.length}.`);
  }

  const IV_LENGTH = 16;
  const HMAC_LENGTH = 64;
  const mix = base64ToUint8Array(encryptedData);

  if (mix.length <= IV_LENGTH + HMAC_LENGTH) {
    console.error('[securedDecrypt] Payload too short.');
    return null;
  }

  const ivBytes = mix.slice(0, IV_LENGTH);
  const receivedHmac = mix.slice(IV_LENGTH, IV_LENGTH + HMAC_LENGTH);
  const ciphertextBytes = mix.slice(IV_LENGTH + HMAC_LENGTH);

  const expectedHmac = hmacSha3_512(secondKeyBytes, ciphertextBytes);
  const hmacValid =
    expectedHmac.length === receivedHmac.length &&
    expectedHmac.every((byte, i) => byte === receivedHmac[i]);

  if (!hmacValid) {
    console.error('[securedDecrypt] HMAC verification failed: data may be tampered.');
    return null;
  }

  const decrypted = CryptoJS.AES.decrypt(
    CryptoJS.lib.CipherParams.create({ ciphertext: uint8ArrayToWordArray(ciphertextBytes) }),
    uint8ArrayToWordArray(firstKeyBytes),
    { iv: uint8ArrayToWordArray(ivBytes), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 },
  );

  const plainText = decrypted.toString(CryptoJS.enc.Utf8);

  if (!plainText) {
    console.error('[securedDecrypt] Decryption failed: empty result.');
    return null;
  }

  try {
    return JSON.parse(plainText) as T;
  } catch {
    console.error('[securedDecrypt] JSON parse failed.');
    return null;
  }
};
