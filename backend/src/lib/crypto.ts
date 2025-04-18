
import crypto from 'crypto';

/**
 * Encrypts sensitive data using AES-256-GCM
 * @param text - Plain text to encrypt
 * @param key - Encryption key from environment variables
 * @returns Encrypted data with iv and auth tag
 */
export function encrypt(text: string, key: string = process.env.OAUTH_ENCRYPTION_KEY || ''): string {
  if (!key) throw new Error('Encryption key not provided');
  if (key.length !== 32) throw new Error('Encryption key must be exactly 32 characters in length');

  // Derive a key using scrypt
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(key, salt, 32);

  // Create initialization vector
  const iv = crypto.randomBytes(16);
  
  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get the auth tag
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Return everything needed for decryption
  return JSON.stringify({
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    encrypted,
    authTag
  });
}

/**
 * Decrypts data encrypted with the encrypt function
 * @param encryptedData - Encrypted data with iv and auth tag
 * @param key - Encryption key from environment variables
 * @returns Decrypted plain text
 */
export function decrypt(encryptedData: string, key: string = process.env.OAUTH_ENCRYPTION_KEY || ''): string {
  if (!key) throw new Error('Encryption key not provided');
  if (key.length !== 32) throw new Error('Encryption key must be exactly 32 characters in length');
  
  // Parse the encrypted data
  const { salt, iv, encrypted, authTag } = JSON.parse(encryptedData);
  
  // Derive the same key using scrypt
  const derivedKey = crypto.scryptSync(key, Buffer.from(salt, 'hex'), 32);
  
  // Create decipher
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    derivedKey,
    Buffer.from(iv, 'hex')
  );
  
  // Set auth tag
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  // Decrypt
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
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
