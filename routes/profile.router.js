const express = require("express");
const { auth } = require("../common/verify-token");
const profileController = require("../controllers/profile.controller")
const util = require('util')
const multer = require('multer');
const uploadImage = require('../models/image-storage')
const router = express.Router();

/*Get info profile */
router.get('/:username', auth ,profileController.getProfile)

/* Update profile */
router.post('/update-info', auth, profileController.updateProfile )

/* Update profile */
router.post('/update-avatar', auth, async (req, res, next) => {
  try {
    const upload = util.promisify(uploadImage)
    await upload(req, res);
    next()
  } catch (error) {
    if (error instanceof multer.MulterError || error) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ message: error.message });
    }
  }
},  profileController.updateAvatar )

module.exports = router