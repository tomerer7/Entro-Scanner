import * as dotenv from 'dotenv';
dotenv.config();

export default {
    server: {
        port: process.env.PORT || 8080
    },
    logLevel: process.env.LOG_LEVEL || 'info'
};