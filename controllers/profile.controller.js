const { uploadImageGoogleDrive } = require('../utils/upload-google-drive');
const AccountDao = require('../dao/account.dao');

async function getProfile(req, res, next) {
  try {
    const user = await AccountDao.findAccountByUsernameOrEmailAndPopulate(
      null,
      req.params.username
    );
    if (!user) {
      return res.status(400).json({ message: 'Account không tồn tại' });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { profile } = req.body;
    await AccountDao.updateProfile(req.user.id, profile);
    res.status(200).json({ message: 'Cập nhật profile thành công' });
  } catch (error) {
    next(error);
  }
}

async function updateAvatar(req, res, next) {
  const idImage = await uploadImageGoogleDrive(req.file);
  const googleDriveLink = `https://drive.google.com/uc?export=view&id=${idImage}`;
  await AccountDao.updateAvatar(req.user.id, googleDriveLink);
  res
    .status(200)
    .json({ message: 'Cập nhật thành công', data: googleDriveLink });
}

module.exports = {
  getProfile: getProfile,
  updateProfile: updateProfile,
  updateAvatar: updateAvatar,
};
