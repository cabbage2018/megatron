'use strict'
const path = require('path')
const fs = require('fs')
const util = require('util')
let nodemailer = require('nodemailer')
const cron = require('node-cron')

class agentEmail {
    /**
     * @param {Object} config
     * 
     */
    constructor(config) {
        this.host = config.host || "http";
        this.port = config.port || 465
        this.sender = config.sender || "mosquitto9@163.com"
        this.from = config.from || "mosquitto9@163.com"
        this.to = config.to || ""
        this.cc = config.cc || ""
        this.bcc = config.bcc || "fei-gao@siemens.com"
        this.subject = config.subject || "stub"
        this.text = config.text || "."
        this.auth = config.auth || {
            "user": "mosquitto9@163.com",
            "pass": "YCXJZFJAOCULMAEG"
        }
        log.trace('agentEmail constructed ', this)
    }

    trigger(contentString) {

    }

    routine() {
        // we can reload config here...

        cron.schedule('8,16,23 * * *', () => {
            console.log('每天3个钟点在第 23 分运行任务')
            { title, attached, content } = this.bootstrap();
        })

        // let job2 = setTimeout(() => {
        //     console.log(`transfer email...`)
        //     postmanRoutine();
        // }, 30000);
    }

    deliver(mailSubject, attached, mailContent) {

        let promise1 = new Promise(async function (resolve, reject) {
            let transport = nodemailer.createTransport({
                host: this.host,
                secure: true,
                // secureConnection: false,
                port: this.port,
                auth: this.auth
            });
            // let  = [];
            var options = {
                from: this.from,
                to: this.to,
                cc: this.cc,
                bcc: this.bcc,
                subject: mailSubject,
                text: mailContent,
                contentType: "text/plain;charset=utf-8",
                attachments: attached
            }
            transport.sendMail(options, function (err, response) {
                transport.close()
                if (err) {
                    reject(err)
                } else {
                    resolve(response)
                }
            })
        })
        return promise1
    }

    trace() {
        let logspath = '/logs/';
        const items = fs.readdirSync(path.join(process.cwd(), logspath));
        let i = 1;
        items.forEach(item => {
            const itemPath = path.join(process.cwd(), `${logspath}/${item}`);
            const stat = fs.statSync(itemPath);
            if (!stat.isDirectory() && (item.indexOf('.log') > 0 || item.indexOf('.gz') > 0)) {
                console.log("target file stat: ", stat)
                // 文件
                attached.push({
                    filename: item,
                    path: itemPath,
                    cid: '000' + i++
                });
            }
        });
    }

    bootstrap() {

        if (process.env.NODE_ENV === 'development') {
            console.log(process.env)
        }

        try {
            const filepath_mail = path.join(process.cwd(), './mail.json');
            if (fs.existsSync(filepath_mail)) {
                log.debug(`${filepath_mail} file found for mqtt`)
                options_mail = JSON.parse(fs.readFileSync(filepath_mail));
            }
            let title = new Date().toISOString()
            let textLog = "trace log is unfortunately wrong empty."
            let filefullpath = path.join(process.cwd(), './logs/livre.txt')
            if (fs.existsSync(filefullpath)) {
                textLog = fs.readFileSync(filefullpath, 'UTF-8');
            }
            let contents = JSON.stringify(process.memoryUsage()) + '\r\n\r\n' + textLog
            const lines = textLog.split(/\r?\n/)
            // lines.forEach((line) => {
            // });
            title = title + ': ' + lines[lines.length - 1]
            console.log('title: ', title)
            postman(options_mail, title, contents)
                .then((resp) => {
                    console.debug(`send successful: `, util.inspect(resp, { showHidden: true, depth: 3, colorize: true }))
                    setTimeout(() => {
                        let logspath = '/logs/';
                        const items = fs.readdirSync(path.join(process.cwd(), logspath));
                        let i = 1;
                        items.forEach(item => {
                            const itemPath = path.join(process.cwd(), `${logspath}/${item}`);
                            const stat = fs.statSync(itemPath);
                            if (!stat.isDirectory() && (item.indexOf('.log') > 0 || item.indexOf('.gz') > 0)) {
                                // 文件
                                if (fs.existsSync(itemPath)) {
                                    console.debug(`now removing${itemPath}.`)
                                    fs.unlinkSync(itemPath)
                                }
                            }
                        });
                    }, 0)
                })
                .catch((err) => {
                    console.error(err);
                })
        } catch (error) {
            console.log(error);
        }

        return { title: "run-time", attached: [], content: "na" }
    }
}

util.inherits(ccClient, events.EventEmitter)
exports.client = ccClient
// log4js.shutdown