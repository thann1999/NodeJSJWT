const express = require("express");
const { auth } = require("../common/verify-token");
const profileController = require("../controllers/profile.controller")
const router = express.Router();

router.get('/', auth ,profileController.getProfile)

router.post('/update', auth, profileController.updateProfile )

module.exports = router