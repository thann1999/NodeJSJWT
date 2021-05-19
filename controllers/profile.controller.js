const { uploadImageGoogleDrive } = require('../utils/upload-google-drive');
const {
  RESPONSE_MESSAGE,
  RESPONSE_STATUS,
} = require('../utils/res-message-status.const');
const AccountDao = require('../dao/account.dao');
const datasetController = require('./dataset.controller');

async function getProfile(req, res, next) {
  try {
    const user = await AccountDao.findAccountByUsernameOrEmailAndPopulate(
      null,
      req.params.username
    );
    if (!user) {
      return res
        .status(RESPONSE_STATUS.ERROR)
        .json({ message: RESPONSE_MESSAGE.RESQUEST_WRONG });
    }
    res.status(RESPONSE_STATUS.SUCCESS).json({ data: user });
  } catch (error) {
    next(error);
  }
}

async function filterDatasetInOneAccount(req, res, next) {
  const { userId, visibility, fileType, sort } = req.body;
  const user = await AccountDao.findAndPopulateDatasetFilter(
    userId,
    visibility,
    fileType,
    sort
  );
  res.status(RESPONSE_STATUS.SUCCESS).json({ data: user.datasets });
}

async function updateProfile(req, res, next) {
  try {
    const { profile } = req.body;
    await AccountDao.updateProfile(req.user.id, profile);
    res
      .status(RESPONSE_STATUS.SUCCESS)
      .json({ message: RESPONSE_MESSAGE.UPDATE_SUCCESS });
  } catch (error) {
    next(error);
  }
}

async function updateAvatar(req, res, next) {
  try {
    const idImage = await uploadImageGoogleDrive(req.file);
    const googleDriveLink = `https://drive.google.com/uc?export=view&id=${idImage}`;
    await AccountDao.updateAvatar(req.user.id, googleDriveLink);
    res.status(RESPONSE_STATUS.SUCCESS).json({
      message: RESPONSE_MESSAGE.UPDATE_SUCCESS,
      data: googleDriveLink,
    });
  } catch (error) {
    next(error);
  }
}

async function changeAccountMode(req, res, next) {
  try {
    const { mode } = req.params;
    await AccountDao.updateAccountMode(req.user.id, mode);
    res
      .status(RESPONSE_STATUS.SUCCESS)
      .json({ message: RESPONSE_MESSAGE.UPDATE_SUCCESS });
  } catch (error) {}
}

async function deleteAccount(req, res, next) {
  const user = await AccountDao.findAccountById(req.user.id);
  await AccountDao.deleteAccountByIdOrEmail(req.user.id, null);
  await datasetController.deleteManyDataset(user.datasets);
  res
    .status(RESPONSE_STATUS.SUCCESS)
    .json({ message: RESPONSE_MESSAGE.DELETE_SUCCESS });
}

module.exports = {
  getProfile: getProfile,
  updateProfile: updateProfile,
  updateAvatar: updateAvatar,
  filterDatasetInOneAccount: filterDatasetInOneAccount,
  changeAccountMode: changeAccountMode,
  deleteAccount: deleteAccount,
};
