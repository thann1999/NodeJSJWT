const express = require('express');
const { auth } = require('../utils/verify-token');
const datasetController = require('../controllers/dataset.controller');
const router = express.Router();

/* Get all tags */
router.get('/all-tags', auth, datasetController.getAllTags);

/* Get recommend dataset */
router.get('/recommend-list', auth, datasetController.getRecommendList);

/* Get recommend dataset */
router.get('/trending', auth, datasetController.findTrendingDataset);

module.exports = router;
