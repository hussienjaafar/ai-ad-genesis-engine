
/**
 * Cryptography utilities for secure token storage
 */
import crypto from 'crypto';

// Validate the encryption key length (32 bytes / 256 bits required for AES-256)
// This validation happens at module load time to fail fast if key is invalid
if (process.env.OAUTH_ENCRYPTION_KEY && process.env.OAUTH_ENCRYPTION_KEY.length !== 32) {
  throw new Error('OAUTH_ENCRYPTION_KEY must be exactly 32 characters (bytes) in length');
}

/**
 * Encrypts sensitive data like OAuth tokens
 * Uses AES-256-GCM with a random salt and IV for each encryption
 * 
 * @param text The plaintext to encrypt
 * @returns Base64 encoded string in format: base64(salt + iv + ciphertext + authTag)
 */
export function encrypt(text: string): string {
  if (!process.env.OAUTH_ENCRYPTION_KEY) {
    throw new Error('OAUTH_ENCRYPTION_KEY is not defined in environment variables');
  }
  
  // Generate a random 16-byte salt for each encryption
  const salt = crypto.randomBytes(16);
  
  // Generate a random 12-byte IV for each encryption (GCM mode recommendation)
  const iv = crypto.randomBytes(12);
  
  // Use the encryption key directly (since we validated its length)
  const key = Buffer.from(process.env.OAUTH_ENCRYPTION_KEY, 'utf8');
  
  // Create cipher with AES-256-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get the authentication tag
  const authTag = cipher.getAuthTag();
  
  // Combine salt + iv + encrypted + authTag and encode as base64
  const result = Buffer.concat([
    salt,
    iv,
    Buffer.from(encrypted, 'hex'),
    authTag
  ]).toString('base64');
  
  return result;
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
  const buffer = Buffer.from(encryptedData, 'base64');
  
  // Extract components from the buffer
  const salt = buffer.subarray(0, 16);
  const iv = buffer.subarray(16, 16 + 12);
  const authTag = buffer.subarray(buffer.length - 16);
  const encrypted = buffer.subarray(16 + 12, buffer.length - 16).toString('hex');
  
  // Use the encryption key directly
  const key = Buffer.from(process.env.OAUTH_ENCRYPTION_KEY, 'utf8');
  
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  
  // Set auth tag
  decipher.setAuthTag(authTag);
  
  // Decrypt
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
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
