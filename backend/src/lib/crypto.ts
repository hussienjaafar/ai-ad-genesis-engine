/**
 * Cryptography utilities for secure token storage
 */
import crypto from 'crypto';

// Validate the encryption key length (32 bytes / 256 bits required for AES-256)
if (process.env.OAUTH_ENCRYPTION_KEY && process.env.OAUTH_ENCRYPTION_KEY.length !== 32) {
  throw new Error('OAUTH_ENCRYPTION_KEY must be exactly 32 characters (bytes) in length');
}

/**
 * Encrypts sensitive data like OAuth tokens
 * Uses AES-256-GCM with a random salt and IV for each encryption
 * 
 * @param text The plaintext to encrypt
 * @returns Base64 encoded string in format: base64(salt:iv:ciphertext:authTag)
 */
export function encrypt(text: string): string {
  if (!process.env.OAUTH_ENCRYPTION_KEY) {
    throw new Error('OAUTH_ENCRYPTION_KEY is not defined in environment variables');
  }
  
  // Generate random salt and IV
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  
  const key = Buffer.from(process.env.OAUTH_ENCRYPTION_KEY, 'utf8');
  
  // Create cipher with AES-256-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  // Encrypt the text
  const encrypted = Buffer.from(cipher.update(text, 'utf8') + cipher.final('utf8'));
  
  // Get the authentication tag
  const authTag = cipher.getAuthTag();
  
  // Combine components with : delimiter and encode as base64
  const combined = Buffer.concat([
    salt,
    Buffer.from(':'),
    iv,
    Buffer.from(':'),
    authTag,
    Buffer.from(':'),
    encrypted
  ]);
  
  return combined.toString('base64');
}

/**
 * Decrypts data that was encrypted with the encrypt function
 * 
 * @param encryptedData Base64 encoded string from the encrypt function
 * @returns The decrypted plaintext
 */
export function decrypt(encryptedData: string): string {
  if (!process.env.OAUTH_ENCRYPTION_KEY) {
    throw new Error('OAUTH_ENCRYPTION_KEY is not defined in environment variables');
  }
  
  // Decode the base64 data
  const combined = Buffer.from(encryptedData, 'base64');
  
  // Split on : delimiter
  const parts = combined.toString().split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted data format');
  }
  
  const salt = Buffer.from(parts[0], 'base64');
  const iv = Buffer.from(parts[1], 'base64');
  const authTag = Buffer.from(parts[2], 'base64');
  const encrypted = Buffer.from(parts[3], 'base64');
  
  // Use the encryption key directly
  const key = Buffer.from(process.env.OAUTH_ENCRYPTION_KEY, 'utf8');
  
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  // Decrypt
  let decrypted = decipher.update(encrypted, null, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generates a cryptographically secure random string
 * for use in CSRF tokens, state parameters, etc.
 * 
 * @returns A random hex string
 */
export function generateSecureRandomString(): string {
  return crypto.randomBytes(32).toString('hex');
}
