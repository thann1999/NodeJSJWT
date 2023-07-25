const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = `${process.env.DB_connection}?retryWrites=true&w=majority`;
  mongoose.set('useCreateIndex', true);

  try {
    await mongoose.connect(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log('Connected BD');
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  connectDatabase: connectDatabase,
};
