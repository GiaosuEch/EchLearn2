/**
 * Enterprise Cryptography Service (Zero-Trust Data Protection)
 * 
 * Secures data payload before storing it in IndexedDB/localStorage.
 * Uses AES-GCM for robust encryption and decryption.
 */

const ENCRYPTION_KEY_NAME = 'echlearn_offline_key';

async function getEncryptionKey(): Promise<CryptoKey> {
  // In a real production system, this key might be derived from a user password/salt
  // or stored in an HttpOnly secure cookie from the backend. 
  // For offline PWA, we persist a generated key in a secure manner (or localStorage for demo).
  let keyString = localStorage.getItem(ENCRYPTION_KEY_NAME);
  
  if (!keyString) {
    const newKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
    const exported = await window.crypto.subtle.exportKey('jwk', newKey);
    keyString = JSON.stringify(exported);
    localStorage.setItem(ENCRYPTION_KEY_NAME, keyString);
    return newKey;
  }

  const jwk = JSON.parse(keyString);
  return await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptPayload(data: any): Promise<{ cipher: string; iv: string }> {
  const key = await getEncryptionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encoded
  );

  return {
    cipher: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv.buffer),
  };
}

export async function decryptPayload(cipherString: string, ivString: string): Promise<any> {
  const key = await getEncryptionKey();
  const ciphertext = base64ToBuffer(cipherString);
  const iv = new Uint8Array(base64ToBuffer(ivString));

  try {
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );
    const decoded = new TextDecoder().decode(decrypted);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decrypt payload. Data might be corrupted or tampered with.', error);
    throw new Error('Decryption Failed');
  }
}
