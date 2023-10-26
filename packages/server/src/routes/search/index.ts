import express from 'express';

import publicationSearchRouter from './publication';
import userSearchRouter from './user';

const router = express.Router();

router.use('/user', userSearchRouter);
router.use('/publication', publicationSearchRouter);

export default router;
