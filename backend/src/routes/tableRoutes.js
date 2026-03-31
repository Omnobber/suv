import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createTableRecord,
  deleteTableRecord,
  getTableRecord,
  listTable,
  patchTableRecord,
  updateTableRecord
} from '../controllers/tableController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});

const upload = multer({ storage });
const router = express.Router();

router.get('/:table', listTable);
router.get('/:table/:id', getTableRecord);
router.post('/:table', upload.single('image'), createTableRecord);
router.put('/:table/:id', upload.single('image'), updateTableRecord);
router.patch('/:table/:id', patchTableRecord);
router.delete('/:table/:id', deleteTableRecord);

export default router;