import * as multer from 'multer';

declare global {
  namespace Express {
    export type Multer = multer.Multer;
  }
}