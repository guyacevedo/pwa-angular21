import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CloudinaryResponse } from '../interfaces/cloudinary-response.interface';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private http = inject(HttpClient);

  private cloudName = environment.cloudinaryConfig?.cloud_name;
  private uploadPreset = environment.cloudinaryConfig?.upload_preset;
  public defaultProfilePictureUrl =
    'https://res.cloudinary.com/dfurubiqj/image/upload/v1759346209/default-profile_qzf9ga_mkixzk.png';

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset!);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    try {
      const response = await firstValueFrom(this.http.post<CloudinaryResponse>(uploadUrl, formData));
      return response?.secure_url || '';
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }

  // Helper to extract publicId from a full Cloudinary URL
  private getPublicIdFromUrl(url: string): string {
    const parts = url.split('/upload/');
    if (parts.length > 1) {
      const publicIdWithVersion = parts[1];
      const publicId = publicIdWithVersion.split('/').slice(1).join('/').split('.')[0];
      return publicId;
    }
    return url;
  }

  getTransformedUrl(imageUrl: string, transformations = ''): string {
    const publicId = this.getPublicIdFromUrl(imageUrl);
    const baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`;
    if (transformations) {
      return `${baseUrl}/${transformations}/${publicId}`;
    } else {
      return `${baseUrl}/${publicId}`;
    }
  }
}
