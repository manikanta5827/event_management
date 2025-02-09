export const validateEnv = () => {
    const required = [
        'DATABASE_URL',
        'JWT_SECRET',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'NODE_ENV'
    ];

    for (const variable of required) {
        if (!process.env[variable]) {
            throw new Error(`Environment variable ${variable} is missing`);
        }
    }
}; 