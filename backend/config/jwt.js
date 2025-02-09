import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
    throw new Error('Environment variable JWT_SECRET is not set.');
}

export const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}; 
