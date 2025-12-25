import { Router } from "express";
import { getUserFromTokenOrGuest, verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";

const router = Router();

router.route("/").get(getAllVideos);
router.route("/:videoId").get(getUserFromTokenOrGuest, getVideoById);


router.use(verifyJWT); 

router.route("/")
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]),
        publishAVideo
    );

router.route("/:videoId")
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/:videoId").patch(togglePublishStatus);

export default router;