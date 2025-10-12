import jwt from 'jsonwebtoken';

export const generateJWT = (id: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const payload = { id };
        jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                reject('Could not generate token');
            } else {
                resolve(token!);
            }
        });
    });
};

export const generateAdminJWT = (id: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const payload = { id, role: 'admin' };
        jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' }, (err, token) => {
            if (err) {
                reject('Could not generate admin token');
            } else {
                resolve(token!);
            }   
        });
    });
};

export const generateVerificationJWT = (id: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = { id, type: 'emailVerification' };
    jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        reject('Could not generate verification token');
      } else {
        resolve(token!);
      }
    });
  });
};

export const verifyVerificationJWT = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        reject('Invalid or expired token');
      } else {
        resolve(decoded);
      }
    });
  });
};
