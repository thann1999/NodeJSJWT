const BaseDao = require("./base.dao");
const Account = require("../models/account.model");

class AccountDao extends BaseDao {
  /*Find account with username and password */
  async findAccountByUsernamePassword(username, password) {
    const query = {
      username: username,
      password: password,
    };
    return await super.findOne(Account, query);
  }

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
      _id: id
    };
    return await super.findOne(Account, query);
  }

  /*Find account with username or email */
  async findAccountByUsernameOrEmail(email, username) {
    const query = { $or: [{ email: email }, { username: username }] };
    return await super.findOne(Account, query);
  }

  /*Create account */
  async createAccount(account = new Account()) {
    return await super.insert(account);
  }

  /*Update activate account */
  async updateVerifyAccount(userId, isVerify) {
    const query = { _id: userId };
    const update = { isVerify: isVerify };
    return await super.updateOne(Account, query, update);
  }

  /*Replace account */
  async findAndReplaceAccount(email, account = new Account()) {
    const query = { email: email };
    return await super.replaceOne(Account, query, account);
  }

  /* Delete account */
  async deleteAccount(email) {
    const query = { email: email };
    return await super.deleteOne(Account, query);
  }
}

const instance = new AccountDao();
module.exports = instance;
