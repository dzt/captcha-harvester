const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const parse = require('url-parse');
const colors = require('colors');
const config = require('./config');

var TWO_MINS = 60 * 2 * 1000 - 10000; /* LOL @ Anybody that actually contribute this is 1min and 50 seconds too risky to make it 2 mins */
var tokens = []
var harvestedToken = 0
var sitekey;

var log = function(type, text) {

    var date = new Date()
    var formatted = date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")

    switch (type) {
        case "warning":
            console.log(`[${formatted}] ${text}`.yellow)
            break;
        case "error":
            console.log(`[${formatted}] ${text}`.red)
            break;
        case "info":
            console.log(`[${formatted}] ${text}`.cyan)
            break;
        case "success":
            console.log(`[${formatted}] ${text}`.green)
            break;

        default:
            console.log(`[${formatted}] ${text}`.white)
    }
}

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));

log('info', `Using Sitekey Provided (${config.sitekey})`);

app.get('/harvest', function(req, res) {
  return res.render('index', {
    count: harvestedToken,
    sitekey: config.sitekey,
    url: parse(config.host).hostname
  });
});

app.get('/usable_tokens', function(req, res) {
  return res.json(tokens);
});

app.post('/submit', function(req, res) {
  //console.log(req.body);
  harvestedToken += 1
  log('info', `Successful Token: ${req.body['g-recaptcha-response']}`);
  tokens.push({
    token: req.body['g-recaptcha-response'],
    timestamp: new Date
  })
  return res.redirect(`${config.host}:3000/harvest`);
});

app.listen(app.get('port'), () => {
  log('success', `Server Harvester started @ ${config.host}:3000/harvest`)
});
