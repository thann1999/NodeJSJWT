const BaseDao = require('./base.dao');
const Account = require('../models/account.model');

class AccountDao extends BaseDao {
  datasetPopulate = 'datasets';

  /*Find account with username and password */
  async findAccountByUsernamePassword(username, password) {
    const query = {
      username: username,
      password: password,
    };
    return await super.findOne(Account, query);
  }

  /*Find account by Id */
  async findAccountById(id) {
    const query = {
      _id: id,
    };
    return await super.findOne(Account, query);
  }

  /*Find account with username or email */
  async findAccountByUsernameOrEmail(email, username) {
    const query = { $or: [{ email: email }, { username: username }] };
    return await super.findOne(Account, query);
  }

  /*Find account with username or email */
  async findAccountByUsernameOrEmailAndPopulate(email, username) {
    const query = { $or: [{ email: email }, { username: username }] };
    const select =
      '_id email avatar name username bio company location dateOfBirth website github datasets';
    return await super.findOneAndPopulate(
      Account,
      query,
      select,
      this.datasetPopulate,
      {},
      {}
    );
  }

  /*Create account */
  async createAccount(account = new Account()) {
    return await super.insertOne(account);
  }

  /*Update activate account */
  async updateVerifyAccount(accountId, isVerify) {
    const query = { _id: accountId };
    const update = { isVerify: isVerify };
    return await super.updateOne(Account, query, update);
  }

  /* Delete account */
  async deleteAccount(email) {
    const query = { email: email };
    return await super.deleteOne(Account, query);
  }

  /*Update password account */
  async updatePassword(accountId, newPassword) {
    const query = { _id: accountId };
    const update = { password: newPassword };
    return await super.updateOne(Account, query, update);
  }

  /* Update profile */
  async updateProfile(accountId, newProfile) {
    const query = { _id: accountId };
    const {
      bio,
      name,
      company,
      location,
      website,
      github,
      dateOfBirth,
    } = newProfile;
    const update = {
      bio: bio,
      name: name,
      company: company,
      location: location,
      website: website,
      github: github,
      dateOfBirth: dateOfBirth,
    };
    return await super.updateOne(Account, query, update);
  }

  /* Update datasetId into field dataset */
  async updateDatasetsOfAccount(accountId, datasetId, isAdd) {
    const query = { _id: accountId };
    const update = isAdd
      ? { $push: { datasets: datasetId } }
      : { $pull: { datasets: datasetId } };
    return await super.updateOne(Account, query, update);
  }

  /* Update profile */
  async updateAvatar(accountId, avatar) {
    const query = { _id: accountId };
    const update = { avatar: avatar };
    return await super.updateOne(Account, query, update);
  }

  /* Find all dataset of account*/
  findAllDatasetOfAccount = async (username) => {
    const query = {
      username: username,
    };
    return await super.findOneAndPopulate(
      Account,
      query,
      {},
      this.datasetPopulate,
      {},
      {}
    );
  };
}

const instance = new AccountDao();
module.exports = instance;
