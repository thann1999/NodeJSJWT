const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = `mongodb+srv://dataworld:dataworld2021
  @graduate-thesis.p4prz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
  console.log(uri);
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
