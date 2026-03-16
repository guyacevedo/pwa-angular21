import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  firebase: {
    projectId: 'YOUR_PROJECT_ID',
    appId: 'YOUR_APP_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    measurementId: 'YOUR_MEASUREMENT_ID',
  },
  cloudinaryConfig: {
    cloud_name: 'YOUR_CLOUD_NAME',
    upload_preset: 'YOUR_UPLOAD_PRESET',
  },
};
