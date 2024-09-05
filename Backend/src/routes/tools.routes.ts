import { Router, Request, Response, json } from 'express';

//middleware
import { upload } from '../middleware/multer.js';
import { authenticateToken } from '../middleware/authenticate.js';

import { addTool, addFiles, searchTools } from '../controllers/tools.controller.js';

const router = Router();
router.use(json());

router.route('/add').all(authenticateToken).post(addTool);

router.route('/:id/media').all(authenticateToken, upload.fields([{ name: 'images' }, { name: 'videos' }, { name: 'files' }])).post(addFiles);

router.get("/search/:search", authenticateToken, searchTools)
export default router;