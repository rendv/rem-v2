/**
 * Created by Julian/Wolke on 07.11.2016.
 */
let Command = require('../../structures/command');
let winston = require('winston');
let request = require('request');
let key = remConfig.lbsearch_nsfw_key;
class Iblewd extends Command {
    constructor({t}) {
        super();
        this.cmd = 'iblewd';
        this.cat = 'nsfw';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        let msgSplit = msg.content.split(' ');
        let msgSearch = '';
        let searchOrig = '';
        for (let i = 1; i < msgSplit.length; i++) {
            if (i === 1) {
                searchOrig = msgSplit[i];
            } else {
                searchOrig = searchOrig + ' ' + msgSplit[i];
            }
        }
        msgSearch = 'rating:e random: ' + searchOrig;
        request.get('https://ibsearch.xxx/api/v1/images.json', {
            qs: {
                limit: 100,
                q: msgSearch
            }, headers: {'X-lbSearch-Key': key}
        }, (error, response, body) => {
            if (error) {
                msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
            }
            if (!error && response.statusCode == 200) {
                try {
                    body = JSON.parse(body);
                } catch (e) {
                    winston.info(e.getMessage());
                }
                if (typeof (body) !== 'undefined' && body.length > 0) {
                    let random = Math.floor(Math.random() * body.length);
                    let img = body[random];
                    msg.channel.createMessage(`https://${img.server}.ibsearch.xxx/${img.path}`);
                } else {
                    msg.channel.createMessage(this.t('nsfw-images.nothing-found', {
                        lngs: msg.lang,
                        tags: searchOrig
                    }));
                }
            }
        });
    }
}
module.exports = Iblewd;