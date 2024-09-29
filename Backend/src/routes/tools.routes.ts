import { Router, json } from 'express';

//middleware
import { upload } from '../middleware/multer.js';
import { authenticateToken } from '../middleware/authenticate.js';

import { addTool, addFiles, searchTools, addComment, getToolDetails, addLike, addDislike, addView, addHistory } from '../controllers/tools.controller.js';

const router = Router();
router.use(json());

router.route('/add').all(authenticateToken).post(addTool);

router.route('/:id/media').all(authenticateToken, upload.fields([{ name: 'images' }, { name: 'videos' }, { name: 'files' }])).post(addFiles);

router.route("/search/:search").all(authenticateToken).get(searchTools);

router.route("/getDetails/:id").all(authenticateToken).get(getToolDetails)

router.route("/addComment/:id").all(authenticateToken).post(addComment);

router.route("/addLike/:id").all(authenticateToken).post(addLike);

router.route("/addDislike/:id").all(authenticateToken).post(addDislike);

router.route("/addView/:id").all(authenticateToken).post(addView);

router.route("/addHistory/:id").all(authenticateToken).post(addHistory);

export default router;