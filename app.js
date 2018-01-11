const remote = require('electron').remote
const app = remote.app
const $ = require('jquery')
const ipcRenderer = require('electron').ipcRenderer
const settings = require('electron-settings')
const shell = require('electron').shell

const Config = require('electron-config');
const config = new Config();

var settingsValues = app.ch.settings.getAll();
var settingsVal = config.get('settingsVal')

$('#sitekey').val(settingsValues.sitekey);
$('#solveURL').val(settingsValues.host);
$('#portNo').val(settingsValues.port);
$('#portNoServer').val(settingsValues.server_port);

$('#sitekey').change(function() {
    settingsValues.sitekey = $(this).val()
    app.ch.settings.set('sitekey', $(this).val());
});

$('#solveURL').change(function() {
    settingsValues.host = $(this).val()
    app.ch.settings.set('host', $(this).val());
});

$('#portNo').change(function() {
    settingsValues.port = $(this).val()
    app.ch.settings.set('port', $(this).val());
});

$('#portNoServer').change(function() {
    settingsValues.server_port = $(this).val()
    app.ch.settings.set('server_port', $(this).val());
});

$('#saveSettings').click(() => {
    remote.getCurrentWindow().reload();
    ipcRenderer.send('restartServer');
});

$('#openCapWindow').click(() => {
    ipcRenderer.send('openCapWindow');
});

$('#openEndpoint').click(() => {
    shell.openExternal(`http://127.0.0.1:${settingsValues.server_port}`);
});

$('#login').click(() => {
    ipcRenderer.send('login');
});

$('#logout').click(() => {

    ipcRenderer.send('logout');
    $("#logout").prop("disabled", true);
    $("#logout").text('Logging Out...');

    setTimeout(function() {
      $("#logout").text('Log Out');
      $("#logout").prop("disabled", false);
    }, 2000);

});

ipcRenderer.on('addHistory', function(event, data) {
  $('#history').append(`
    <li class="list-group-item" style="text-align: left; font-size: 13px;">
    ${data.host}
    <span class="badge" style="background-color: #f9ce56;" id="${data.token}">Expires in 110 seconds</span>
    </li>`);
});

ipcRenderer.on('updateHistory', function(event, data) {
  if (data.time == 1) {
    $(`#${data.token}`).text('Expires in 1 second');
  } else {
    $(`#${data.token}`).text(`Expires in ${data.time} seconds`);
  }
});

ipcRenderer.on('markExpired', function(event, data) {
  $(`#${data.token}`).text('Expired')
  $(`#${data.token}`).css({'background-color': '#f9565d'});
});
