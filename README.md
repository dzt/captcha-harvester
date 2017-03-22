# captcha-harvester
Generate Captcha Tokens with ease.

![gif](anim.gif)

### Installation

captcha-harvester requires [Node.js](http://nodejs.org/).

Setup:

```sh
$ git clone https://github.com/dzt/captcha-harvester.git
$ cd captcha-harvester
$ npm install
```

Configure information inside the `config.example.json` be sure to rename it to `config.json` or simply run `mv config.example.json config.json` (macOS & Windows) when you're done. Be sure to provide a valid site-key.

Host Configuration Setup for macOS users:
- Open up the `hosts` file under `C:\Windows\System32\Drivers\etc\hosts` in your desired text editor.
- Modify the file by adding your desired host, for example `127.0.0.1 supremenewyork.com` or `127.0.0.1 dev.adidas.com`
- Save the file

Host Configuration Setup for Windows users:
- Edit the hosts file under `/private/etc/hosts` for example you can use Vim by typing in `sudo vim /private/etc/hosts` to edit.
- Modify the file by adding your desired host, for example `127.0.0.1 supremenewyork.com` or `127.0.0.1 dev.adidas.com`
- Save the file.

A little bit confused? Checkout [this](https://support.rackspace.com/how-to/modify-your-hosts-file/) article.

Run After Setup:

```sh
$ node server
```

## Todo List
- [x] Self Destruct individual tokens when expired.
- [ ] Database Integration w/ MongoDB & SQLite
- [x] RESTful API endpoint that returns a JSON Array of usable tokens.

### Who

Written by <a href="http://petersoboyejo.com/">@dzt</a>, made better by you.

## License

```
The MIT License (MIT)

Copyright (c) 2017 Peter Soboyejo <http://petersoboyejo.com/>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
