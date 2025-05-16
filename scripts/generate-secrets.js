// scripts/generate-secrets.js
import crypto from 'crypto';

const generateSecretBase64 = (lengthBytes = 64) => {
  return crypto.randomBytes(lengthBytes).toString('base64');
};

const generateSecretHex = (lengthBytes = 64) => {
  return crypto.randomBytes(lengthBytes).toString('hex');
};

const generateSecretAscii = (length = 64) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:,.<>/?";
  let secret = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    secret += charset.charAt(Math.floor(Math.random() * n));
  }
  return secret;
};

// Примеры использования:
const jwtAccessSecret = generateSecretHex(32);
const jwtRefreshSecret = generateSecretHex(32); 
const jwtConfirmEmailSecret = generateSecretHex(32);
const jwtResetPasswordSecret = generateSecretHex(32); 

console.log("JWT_ACCESS_SECRET=", jwtAccessSecret);
console.log("JWT_REFRESH_SECRET=", jwtRefreshSecret);
console.log("JWT_CONFIRM_EMAIL_SECRET=", jwtConfirmEmailSecret);
console.log("JWT_RESET_PASSWORD_SECRET=", jwtResetPasswordSecret);