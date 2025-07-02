export const envConfig = async () => {
    return {
        NODE_ENV: process.env.NODE_ENV || 'development'
    }
}