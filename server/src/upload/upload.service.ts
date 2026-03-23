import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, unlink, unlinkSync } from 'fs';
import { join } from 'path';

export type UploadFolder =
  | 'avatars'
  | 'company-pictures'
  | 'event-posters'
  | 'news-images';

@Injectable()
export class UploadService {
  private readonly base = join(process.cwd(), 'uploads');

  ensureFolder(folder: UploadFolder): void {
    const path = join(this.base, folder);
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
  }

  getFileUrl(folder: UploadFolder, filename: string): string {
    return `/uploads/${folder}/${filename}`;
  }

  deleteByUrl(url: string): void {
    if (!url || url === 'default') return;
    const fullPath = join(this.base, url.replace('/uploads/', ''));
    if (existsSync(fullPath)) unlinkSync(fullPath);
  }
}
