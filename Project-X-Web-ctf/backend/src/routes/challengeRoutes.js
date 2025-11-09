import express from 'express';
import { getChallenges, submitFlag } from '../controllers/challengeController.js';
const router = express.Router();
router.get('/', getChallenges);
router.post('/submit', submitFlag);
export default router;
