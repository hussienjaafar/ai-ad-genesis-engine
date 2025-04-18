
import { encrypt, decrypt } from '../src/lib/crypto';
import * as dotenv from 'dotenv';
dotenv.config();

describe('Crypto Utility Functions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('encrypt throws error when key length is not 32 characters', () => {
    // Short key
    expect(() => {
      encrypt('test data', 'short_key');
    }).toThrow('Encryption key must be exactly 32 characters in length');

    // Long key
    expect(() => {
      encrypt('test data', 'this_is_a_key_that_is_way_too_long_to_use');
    }).toThrow('Encryption key must be exactly 32 characters in length');
  });

  test('decrypt throws error when key length is not 32 characters', () => {
    const encryptedData = encrypt('test data', '12345678901234567890123456789012');
    
    // Short key
    expect(() => {
      decrypt(encryptedData, 'short_key');
    }).toThrow('Encryption key must be exactly 32 characters in length');
    
    // Long key
    expect(() => {
      decrypt(encryptedData, 'this_is_a_key_that_is_way_too_long_to_use');
    }).toThrow('Encryption key must be exactly 32 characters in length');
  });

  test('encrypt and decrypt can successfully round-trip data', () => {
    const key = '12345678901234567890123456789012'; // 32 characters
    const originalData = 'This is a secret message that needs encryption!';
    
    const encryptedData = encrypt(originalData, key);
    const decryptedData = decrypt(encryptedData, key);
    
    expect(decryptedData).toBe(originalData);
  });
  
  test('different encryptions of same data yield different ciphertexts', () => {
    const key = '12345678901234567890123456789012';
    const data = 'Same data, different encryption';
    
    const encryption1 = encrypt(data, key);
    const encryption2 = encrypt(data, key);
    
    // Different random salts should make ciphertexts different
    expect(encryption1).not.toBe(encryption2);
    
    // But both should decrypt to the same plaintext
    expect(decrypt(encryption1, key)).toBe(data);
    expect(decrypt(encryption2, key)).toBe(data);
  });

  test('encrypted data is base64 encoded', () => {
    const key = '12345678901234567890123456789012';
    const data = 'Test data for base64 check';
    
    const encrypted = encrypt(data, key);
    
    // Check if encrypted result is valid base64
    expect(() => Buffer.from(encrypted, 'base64')).not.toThrow();
    
    // Base64 pattern test
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    expect(base64Regex.test(encrypted)).toBe(true);
  });
});
