
import crypto from 'crypto';

// Validate key length before exporting any functions
if (process.env.NODE_ENV !== 'test' && process.env.OAUTH_ENCRYPTION_KEY && process.env.OAUTH_ENCRYPTION_KEY.length !== 32) {
  throw new Error('Encryption key must be exactly 32 characters in length');
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * @param text - Plain text to encrypt
 * @param key - Encryption key from environment variables
 * @returns Encrypted data with iv and auth tag as base64 string
 */
export function encrypt(text: string, key: string = process.env.OAUTH_ENCRYPTION_KEY || ''): string {
  if (!key) throw new Error('Encryption key not provided');
  if (key.length !== 32) throw new Error('Encryption key must be exactly 32 characters in length');

  // Create random salt and initialization vector
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  
  // Derive a key using scrypt
  const derivedKey = crypto.scryptSync(key, salt, 32);

  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Get the auth tag
  const authTag = cipher.getAuthTag();
  
  // Combine salt + iv + ciphertext + tag
  const result = Buffer.concat([
    salt,
    iv,
    Buffer.from(encrypted, 'base64'),
    authTag
  ]);
  
  // Return as base64 string for storage
  return result.toString('base64');
}

/**
 * Decrypts data encrypted with the encrypt function
 * @param encryptedData - Base64 encoded encrypted data 
 * @param key - Encryption key from environment variables
 * @returns Decrypted plain text
 */
export function decrypt(encryptedData: string, key: string = process.env.OAUTH_ENCRYPTION_KEY || ''): string {
  if (!key) throw new Error('Encryption key not provided');
  if (key.length !== 32) throw new Error('Encryption key must be exactly 32 characters in length');
  
  // Decode the base64 string to buffer
  const buffer = Buffer.from(encryptedData, 'base64');
  
  // Extract components
  const salt = buffer.subarray(0, 16);
  const iv = buffer.subarray(16, 28);
  const authTag = buffer.subarray(buffer.length - 16);
  const encrypted = buffer.subarray(28, buffer.length - 16).toString('base64');
  
  // Derive the same key using scrypt
  const derivedKey = crypto.scryptSync(key, salt, 32);
  
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
  
  // Set auth tag
  decipher.setAuthTag(authTag);
  
  // Decrypt
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generates a crypto-secure random string for use as a state parameter
 * @returns Random string suitable for OAuth state parameter
 */
export function generateSecureRandomString(): string {
  return crypto.randomUUID();
}
