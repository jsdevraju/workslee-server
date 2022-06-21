import { Router } from "express";
import {
  createJob,
  deleteJobPost,
  getAllJobPost,
  getSingleJobPost,
  updateJobPost,
} from "../controllers/jobCtrl.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = Router();

router.post("/post/job", isAuthenticated, createJob);
router.get("/jobs", getAllJobPost);
router.get("/job/:id", getSingleJobPost);
router.put("/job/:id", isAuthenticated, updateJobPost);
router.delete("/job/:id", isAuthenticated, deleteJobPost);

export default router;
