class BaseDao {
  insert(doc) {
    return new Promise((resolve, reject) => {
      doc.save((err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  find(model, query) {
    return new Promise((resolve, reject) => {
      model.find(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  findOne(model, query) {
    return new Promise((resolve, reject) => {
      model.findOne(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  updateMany(model, query, update) {
    return new Promise((resolve, reject) => {
      model.updateMany(query, update, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  updateOne(model, query, update) {
    return new Promise((resolve, reject) => {
      model.updateOne(query, update, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  deleteOne(model, query) {
    return new Promise((resolve, reject) => {
      model.deleteOne(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  replaceOne(model, query, replace) {
    return new Promise((resolve, reject) => {
      model.findOneAndReplace(query, replace, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  findSortAndLimit(model, query, sort, limit) {
    return new Promise((resolve, reject) => {
      model
        .find(query)
        .sort(sort)
        .limit(limit)
        .exec((err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
    });
  }
}

module.exports = BaseDao;
