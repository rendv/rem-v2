/**
 * Created by Julian/Wolke on 08.11.2016.
 */
/**
 * The youtube importer
 * @extends EventEmitter
 *
 */
let BasicImporter = require('../../structures/basicImporter');
const types = require('../../structures/constants').SONG_TYPES;
let Song = require('../../structures/song');
let ytdl = require('ytdl-core');
class YoutubeImporter extends BasicImporter {
    constructor() {
        super();
    }

    loadSong(url) {
        try {
            ytdl.getInfo(url, (err, info) => {
                if (err) {
                    this.emit('error', err);
                } else {
                    if (info.live_playback === '1') {
                        this.emit('error', 'uwu');
                    } else {
                        info.loaderUrl = `https://www.youtube.com/watch?v=${info.video_id}`;
                        let isOpus = this.filterOpus(info.formats);
                        let directUrl = this.filterStreams(info.formats);
                        let song = new Song({
                            id: info.video_id,
                            title: info.title,
                            duration: this.convertDuration(info),
                            type: types.youtube,
                            url: info.loaderUrl,
                            streamUrl: directUrl,
                            isOpus: isOpus,
                            isResolved: true,
                            local: false
                        });
                        this.emit('done', song);
                    }
                }
            });
        } catch (e) {
            this.emit('error', e);
        }
    }

    resolveSong(song) {
        let that = this;
        return new Promise(function (resolve, reject) {
            ytdl.getInfo(song.url, (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    info.loaderUrl = `https://www.youtube.com/watch?v=${info.video_id}`;
                    let directUrl = that.filterStreams(info.formats);
                    let song = new Song({
                        id: info.video_id,
                        title: info.title,
                        duration: that.convertDuration(info),
                        type: types.youtube,
                        url: info.loaderUrl,
                        streamUrl: directUrl,
                        needsYtdl: !directUrl,
                        isResolved: true,
                        local: false
                    });
                    resolve(song);
                }
            });
        });
    }

    filterOpus(formats) {
        for (let i = 0; i < formats.length; i++) {
            // console.log(formats[i].itag);
            if (formats[i].itag === '250' || formats[i].itag === '251' || formats[i].itag === '249') {
                // console.log(formats[i]);
                return formats[i].url;
            }
        }
        return null;
    }

    filterStreams(formats) {
        for (let i = 0; i < formats.length; i++) {
            // console.log(formats[i].itag);
            if (formats[i].itag === '250' || formats[i].itag === '251' || formats[i].itag === '249') {
                // console.log(formats[i]);
                return formats[i].url;
            }
            if (formats[i].container === 'mp4' && formats[i].audioEncoding || formats[i].container === 'webm' && formats[i].audioEncoding) {
                return formats[i].url;
            }
            if (formats[i].audioEncoding) {
                return formats[i].url;
            }
        }
        return null;
    }
}
module.exports = YoutubeImporter;