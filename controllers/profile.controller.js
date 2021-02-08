const Account = require('../models/account.model');
const AccountDao = require('../dao/account.dao');

async function getProfile(req, res, next) {
  try {
    const user = await AccountDao.findAccountById(req.user.id);
    const info = new Account({
      email: user.email,
      avatar: user.avatar,
      name: user.name,
      username: user.username,
      bio: user.bio,
      company: user.company,
      location: user.location,
      dateOfBirth: user.dateOfBirth,
      website: user.website,
      github: user.github,
    });
    res.status(200).json({ message: info });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile: getProfile,
};
