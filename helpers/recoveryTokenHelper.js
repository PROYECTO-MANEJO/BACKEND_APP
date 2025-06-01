const crypto = require('crypto');
const bcrypt = require('bcrypt');

const generateRecoveryToken = async () => {
  const token = crypto.randomBytes(20).toString('hex');
  const hashedToken = await bcrypt.hash(token, 10);
  const expiry = new Date(Date.now() + 3600000); // 1 hora completa
  return { token, hashedToken, expiry };
};

module.exports = { generateRecoveryToken };