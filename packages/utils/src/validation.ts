import { z } from 'zod';

export class ValidationUtils {
  static isValidFileType(filename: string, allowedTypes: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }

  static isValidAudioFile(filename: string): boolean {
    const audioTypes = ['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg'];
    return this.isValidFileType(filename, audioTypes);
  }

  static isValidImageFile(filename: string): boolean {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return this.isValidFileType(filename, imageTypes);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  static validateTrackMetadata(metadata: any) {
    const schema = z.object({
      title: z.string().min(1).max(200),
      genre: z.string().min(1).max(50),
      bpm: z.number().min(40).max(300).optional(),
      key: z.string().max(10).optional(),
      mood: z.string().max(50).optional(),
    });

    return schema.safeParse(metadata);
  }

  static validateSocialLinks(links: any) {
    const socialLinkSchema = z.object({
      spotify: z.string().url().optional(),
      instagram: z.string().url().optional(),
      twitter: z.string().url().optional(),
      youtube: z.string().url().optional(),
      tiktok: z.string().url().optional(),
    });

    return socialLinkSchema.safeParse(links);
  }

  static isValidPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}