import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadFolder } from './upload.service';
import { BadRequestException } from '@nestjs/common';

export const createMulterConfig = (folder: UploadFolder) => ({
  storage: diskStorage({
    destination: `./uploads/${folder}`,
    filename: (req, file, callBack) => {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callBack(null, `${file.fieldname}-${uniqueName}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
      return cb(
        new BadRequestException('Only jpeg, png, webp, gif allowed'),
        false,
      );
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});
