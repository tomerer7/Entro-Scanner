import devConfig from './dev';
import prodConfig from './prod';

interface AppConfig {
    server: {
        port: any;
    };
    logLevel: string;
}

let config: AppConfig;

switch (process.env.NODE_ENV) {
    case 'production':
        config = prodConfig;
        break;
    default:
        config = devConfig;
}

export default config;