
import express from 'express';
import ContentController from '../controllers/contentController';
import authorize from '../middleware/auth';

const router = express.Router();

router.get('/:id', authorize, ContentController.getContentById);

export default router;
