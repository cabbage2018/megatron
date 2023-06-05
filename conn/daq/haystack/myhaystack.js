'use strict'

const {
    pbkdf2Sync,
} = require('crypto');
const crypto = require('crypto');
const request = require('supertest')
const util = require('util')
const events = require('events')
function sleep(ms) { return new Promise(function (resolve, reject) { setTimeout(resolve, ms); }) }
const log4js = require('log4js')
let log = log4js.getLogger(':myhaystack:');

class hsClient {
  /**
   * @param {jsonObj} 
   * 
   */  constructor(jsonObj) {

        this.uri = jsonObj.uri;
        let founds = this.uri.match(/(http|https):\/\/([^\/]+)\/([^$]+)$/i);
        this.host = founds[2];
        this.serverPath = "/" + founds[3];
        for (let s in founds) {
            console.log(s, ">>", founds[s]);
        }

        this.authPath = "/user/auth";
        // this.host = jsonObj.host;
        // this.serverPath = jsonObj.serverPath;
        this.user = jsonObj.user;
        this.pass = jsonObj.pass;
        // this.token = "";
        this.logined = undefined;

        /** Base64 table */
        this.tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        this.nonce = "nonce(256/8)";
        this.bearerToken = undefined

        this.gheader = "n,";
        this.username = jsonObj.user;
        this.password = jsonObj.pass;
        this.salt = this.nonce
        this.iteration = undefined

        this.saltedPassword = undefined
        this.clientKey = undefined
        this.storedKey = undefined
        this.authMessage = undefined
        this.clientSignature = undefined
        this.clientProof = undefined

        this.clientId = "Node8Client" + Math.floor(Math.random() * 65535);
        log.mark('constructed', this);
    }

    /*
        some support function from Haystack Examples    
    */
    randstr(len) {
        if (len == null) len = 24;
        var text = "";
        var possible = this.tab;
        for (var i = 0; i < len; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    text2obj(text) {
        let arr = text.toString().split(",");
        let obj = {};
        arr.forEach(function (val) {
            if (val.indexOf("=") > 0) {
                let pos = val.indexOf("=");
                let leading = val.substr(0, pos);
                let assignd = val.substr(pos + 1);
                obj[leading] = assignd;
                log.info(val + ": " + "\"" + leading + "\"" + " :" + "\"" + assignd + "\"");
            }
        });
        return obj;
    }

    str2words(str) {
        log.info(str.length, "->", str)
        var output = Array(str.length >> 2);
        for (var i = 0; i < output.length; i++)
            output[i] = 0;
        for (var i = 0; i < str.length * 8; i += 8) {
            output[i >> 5] |= (str.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
        }
        return output;
    }

    words2str(narr) {
        var output = "";
        for (var i = 0; i < narr.length * 32; i += 8) {
            output += String.fromCharCode((narr[i >> 5] >>> (24 - i % 32)) & 0xFF);
            // log.info("narr[i >> 5]: ", narr[i >> 5]);
        }
        return output;
    }

    encode(unencoded) {
        return Buffer.from(unencoded || '').toString('base64');
    };

    decode(encoded) {
        return Buffer.from(encoded || '', 'base64').toString('utf8');
    };

    urlEncode(unencoded) {
        const encoded = this.encode(unencoded);
        return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    };

    urlDecode(encoded) {
        encoded = encoded.replace(/\-/g, '+').replace(/_/g, '/');
        while (encoded.length % 4)
            encoded += '=';
        return this.decode(encoded);
    };

    raw2base64(input) {
        var b64pad = "=";
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var output = "";
        var len = input.length;
        for (var i = 0; i < len; i += 3) {
            var triplet = (input.charCodeAt(i) << 16)
                | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0)
                | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
            for (var j = 0; j < 4; j++) {
                if (i * 8 + j * 6 > input.length * 8) output += b64pad;
                else output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
            }
        }
        return output;
    }

    hmac(key, string) {
        return crypto.createHmac('sha256', key).update(string).digest('hex');
    }

    hash(string) {
        return crypto.createHash('sha256').update(string).digest('hex');
    }

    pbkdf2(secret, salt, iteration, keylen, digest) {
        return pbkdf2Sync(secret, salt, iteration, keylen, digest);
    }

    /*
        https://www.rfc-editor.org/rfc/rfc7804#page-12
    */
    hello() {
        this.nonce = this.randstr(16);
        log.debug("this.nonce: ", this.nonce);
        this.usernameBase64Url = this.urlEncode(this.username);
        log.debug("this.usernameBase64Url: ", this.usernameBase64Url);
        let that = this;
        return new Promise(function (resolve, reject) {
            request(`http://${that.host}`)
                .get(`${that.serverPath}${that.authPath}`)
                .set('Authorization', `HELLO username=${that.usernameBase64Url}`)
                .set('User-Agent', `${that.clientId}`)
                .send('')
                .then(results => {
                    if (results.error) {
                        log.mark(results.error);
                    } else {
                    }
                    log.debug('Hello handshake');
                    log.mark(util.inspect(results.headers, { showHidden: true, depth: 3, colorize: true }));
                    log.trace(`results.headers["www-authenticate"] received: ${results.headers["www-authenticate"]}`);
                    let res = results.headers["www-authenticate"];
                    resolve(res);
                })
                .catch((err) => {
                    log.trace(`status code != 2xx expected: ${err}`);
                    reject(err);
                })
        })
    }

    processHello(wwwauth) {
        log.info(wwwauth);
        let data = wwwauth.split(" ")[1];
        let obj = this.text2obj(data);
        this.handshakeToken = obj["handshakeToken"];
        this.hashScheme = obj["hash"];
    }

    /*
    WWW-Authenticate:
    scram data=cj1qeDVCcjRMcTJmWEFXNUFmYjZlZjUxOGE4YTQ5N2I1NzczNDVmOWQ4ZGNmYTI2Y2Iscz0xZGF5cUdsa0s2MG1mN21KSUZnbFFXWkJHZHBUUEFaQ1Z6Lzg1dzRKaUFFPSxpPTEwMDAw
    , handshakeToken=b3A
    , hash=SHA-256
    */
    sendfirst() {
        this.firstMessageBare = `n=${this.username},r=${this.nonce}`;
        this.firstMessageDecorate = `${this.gheader},${this.firstMessageBare}`;
        this.firstMessageBase64 = this.urlEncode(this.firstMessageDecorate);
        log.info("this.firstMessageBase64 : ", this.firstMessageBase64);
        let that = this
        return new Promise(function (resolve, reject) {
            request(`http://${that.host}`)
                // .get(`api/cccg/user/auth`)
                .get(`${that.serverPath}${that.authPath}`)
                .set('Authorization', `scram data=${that.firstMessageBase64},handshakeToken=${that.usernameBase64Url}`)
                .set('User-Agent', `${that.clientId}`)
                .set('Access-Control-Allow-Origin', '*')
                .send('')
                .then(results => {
                    if (results.error) {
                        // reject(results.error);
                    } else {

                    }

                    log.debug('First handshake');
                    log.mark(util.inspect(results.headers, { showHidden: true, depth: 3, colorize: true }));

                    let res = results.headers["www-authenticate"];
                    if (res) {
                        // that.processFirst(res);
                        resolve(res);
                    } else {
                        reject("NO www-authenticate in send-first resp header.");
                    }

                })
                .catch((err) => {
                    log.trace(`status code != 2xx expected: ${err}`);
                    reject(err)
                })
        })
    }

    processFirst(wwwauth) {
        log.info(wwwauth);

        let data = wwwauth.split(" ")[1];
        let obj = this.text2obj(data);
        let base64UrlText = obj["data"];
        let recovered = this.urlDecode(base64UrlText);
        let json = this.text2obj(recovered);

        this.r = json["r"];
        this.salt = json["s"];
        this.iteration = parseInt(json["i"]);
        this.saltBase64 = Buffer.from(this.salt, 'base64');
        log.info("this.saltBase64: ", this.saltBase64);

        //n,,n=op,r=jx5Br4Lq2fXAW5Af
        this.firstRespBare = `r=${this.r},s=${this.salt},i=${this.iteration}`;
        log.info("this.firstRespBare: ", this.firstRespBare);

        this.saltedPassword = this.pbkdf2(this.password, this.saltBase64, this.iteration, 256 / 8, "sha256");
        this.clientKey = this.hmac(Buffer.from(this.saltedPassword), "Client Key");
        this.storedKey = this.hash(Buffer.from(this.clientKey, 'hex'));

        log.info("this.saltedPassword: ", this.saltedPassword);
        log.info("this.clientKey: ", this.clientKey);
        log.info("this.storedKey: ", this.storedKey);

        let gheader2 = this.urlEncode("n,,");
        this.finalMessageNoProof = `c=${gheader2},r=${this.r}`;

        this.authMessage = `${this.firstMessageBare},${this.firstRespBare},${this.finalMessageNoProof}`
        log.info("this.authMessage", this.authMessage);

        this.clientSignature = this.hmac(Buffer.from(this.storedKey, 'hex'), this.authMessage);
        log.info(Buffer.from(this.clientSignature), this.clientSignature, "-->clientSignature");

        if (this.clientKey.length !== this.clientSignature.length) {
            throw "xor oprands length does not match.";
        }
        let y1 = Buffer.from(this.clientKey, 'hex');
        let y2 = Buffer.from(this.clientSignature, 'hex');;
        for (var i = 0; i < y1.length; ++i) {
            y1[i] ^= y2[i];
        }
        log.info("xor: ", y1, y1.toString(), y1.length);

        this.clientProof = this.encode(y1);
        log.info("this.clientProof: ", this.clientProof, this.clientProof.length);

        this.finalScramData = `c=${gheader2},r=${this.r},p= ${this.clientProof}`;

        this.finalScramDatabase64 = this.encode(this.finalScramData);
        log.info(`this.finalScramDatabase64: ${this.finalScramDatabase64},`);
    }

    /*
    Some examples of such codepoints include Vulgar
    Fraction One Half (U+00BD) and Acute Accent (U+00B4).

    SaltedPassword  := Hi(Normalize(password), salt, i)
    ClientKey       := HMAC(SaltedPassword, "Client Key")
    StoredKey       := H(ClientKey)
    AuthMessage     := client-first-message-bare + "," +
                        server-first-message + "," +
                        client-final-message-without-proof
    ClientSignature := HMAC(StoredKey, AuthMessage)
    ClientProof     := ClientKey XOR ClientSignature
    */
    sendFinal() {
        let that = this;
        return new Promise(function (resolve, reject) {
            log.info(`scram data=${that.finalScramDatabase64},handshakeToken=${that.usernameBase64Url}`);
            request(`http://${that.host}`)
                .get(`${that.serverPath}${that.authPath}`)
                .set('Authorization', `scram data=${that.finalScramDatabase64},handshakeToken=${that.usernameBase64Url}`)
                .set('User-Agent', `${that.clientId}`)
                .set('Access-Control-Allow-Origin', '*')
                .send('')
                .then(results => {
                    if (results.error) {
                        log.error(results.headers);
                    } else {
                        log.info(results.text);
                    }
                    log.debug('Final handshake');
                    log.mark(util.inspect(results.headers, { showHidden: true, depth: 3, colorize: true }));
                    let str = results.headers["authentication-info"];
                    let res = "bearer " + str.split(",")[0];
                    that.bearerToken = res;
                    if (res) {
                        resolve(res);
                    } else {
                        reject("NO authentication-info in send-final resp header.");
                    }

                })
                .catch((err) => {
                    reject(err)
                    log.trace(`status code != 2xx expected: ${err}`);
                })
        })
    }

    processFinal(wwwauth) {
        log.info(wwwauth);
    }

    about() {
        let that = this
        return new Promise(function (resolve, reject) {
            request(`http://${that.host}`)
                .get(`${that.serverPath}/about`)
                .set('Authorization', `${that.bearerToken}`)
                .set('User-Agent', `${that.clientId}`)
                .set('Access-Control-Allow-Origin', '*')
                .send('')
                .then(results => {
                    log.mark(util.inspect(results.headers, { showHidden: true, depth: 3, colorize: true }));

                    if (results.error) {
                        log.error(results.headers);
                    } else {
                        log.info(results);
                    }
                    resolve(results.body);
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    read(body) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let authToken = that.token;
            console.log(that)
            request(`http://${that.host}`)
                .post(`${that.serverPath}/read`)
                .set('Authorization', `${that.bearerToken}`)
                .set('User-Agent', `${that.clientId}`)
                .set('Accept', 'text/zinc')
                .set('Content-Type', 'text/zinc; charset=utf-8')
                .send(body)
                .then(results => {
                    if (results.error) {
                        log.error(results.error, "caused by->>>", body);
                        reject(results.error)
                    } else {
                        // log.mark(results)
                        resolve(results.text);
                    }
                    // resolve(results.text);
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    hisRead(body) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let authToken = that.token;
            request(`http://${that.host}`)
                .post(`${that.serverPath}/hisRead`)
                .set('Authorization', `${that.bearerToken}`)
                .set('User-Agent', `${that.clientId}`)
                .set('Accept', 'text/zinc')
                .set('Content-Type', 'text/zinc; charset=utf-8')
                .send(body)
                .then(results => {
                    if (results.error) {
                        reject(results.error)
                        log.error(results.error, "caused by->>>", body);
                    } else {
                        resolve(results.text);
                        // log.debug(results.text);

                        log.info("0.>", util.inspect(results.text, { showHidden: true, depth: 3, colorize: true }));
                    }
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    close() {
    }

    connect() {
        return this.hello()
            .then((responseBody) => {
                this.processHello(responseBody);
                return this.sendfirst();
            })
            .then((responseBody) => {
                this.processFirst(responseBody);
                return this.sendFinal();
            })
            .then((responseBody) => {
                this.processFinal(responseBody);
                return this.read("ver:\"3.0\"\nfilter,limit\n\"equip\",80\n");
            })
            .catch((statusError) => {
                log.error(statusError, "failed @haystack protocol comm: handshake()...")
            })
    }

}

util.inherits(hsClient, events.EventEmitter);
exports.client = hsClient