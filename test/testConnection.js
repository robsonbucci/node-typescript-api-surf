const mongoose = require('mongoose');

const dbName = 'surf-forecast';
const host = '192.168.18.17';
const port = '27017';

const url = `mongodb://${host}:${port}/${dbName}`;

mongoose
  .connect(url)
  .then(() => console.log('conectou'))
  .catch((e) => console.log(e));
