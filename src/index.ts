import express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

const app: express.Application = express();
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', require('./routes/root'));

module.exports = app;
