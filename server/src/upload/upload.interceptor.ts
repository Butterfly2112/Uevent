import { Injectable } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { createMulterConfig } from './multer.config';

@Injectable()
export class AvatarUploadInterceptor extends FileInterceptor('file', {
  ...createMulterConfig('avatars'),
  limits: { fileSize: 5 * 1024 * 1024 },
}) {}

@Injectable()
export class CompanyPictureUploadInterceptor extends FileInterceptor(
  'picture',
  {
    ...createMulterConfig('company-pictures'),
    limits: { fileSize: 5 * 1024 * 1024 },
  },
) {}

@Injectable()
export class EventPosterUploadInterceptor extends FileInterceptor('file', {
  ...createMulterConfig('event-posters'),
  limits: { fileSize: 5 * 1024 * 1024 },
}) {}

@Injectable()
export class NewsImagesUploadInterceptor extends FilesInterceptor(
  'images',
  10,
  {
    ...createMulterConfig('news-images'),
    limits: { fileSize: 10 * 1024 * 1024 },
  },
) {}
