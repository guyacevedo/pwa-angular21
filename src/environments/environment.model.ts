export interface Environment {
  production: boolean;
  firebase?: {
    projectId: string;
    appId: string;
    storageBucket: string;
    apiKey: string;
    authDomain: string;
    messagingSenderId: string;
    measurementId: string;
  };
  cloudinaryConfig?: {
    cloud_name: string;
    upload_preset: string;
  };
}
