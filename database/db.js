const mongoose = require("mongoose");

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose
      .connect(
        process.env.MONGODB_URI ||
          "mongodb+srv://byadiso:Uwineza3010@cluster0.kbaby.mongodb.net/kodesha?retryWrites=true&w=majority",
        {
          useNewUrlParser: true,
          useCreateIndex: true,
          useUnifiedTopology: true,
        }
      )
      .then(() => console.log("DB Connected"))
      .catch((err) => {
        console.error(`Error connecting to  the database . \n${err}`);
      });
  }
}

module.exports = new Database();
