import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
    throw new Error('Environment variable JWT_SECRET is not set.');
}

export const generateToken = (user, role) => {
    return jwt.sign(
        { id: user.id, name: user.name, profile_img: user.profile_img, role },
        process.env.JWT_SECRET,
        { expiresIn: '48h' }
    );
};

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}; 
