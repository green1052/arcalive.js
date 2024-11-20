import got from "got";
import {CookieJar} from "tough-cookie";
import {Channel} from "./Channel.js";

export class Arcalive {
    private readonly cookieJar = new CookieJar();
    private readonly client;

    constructor(token: string, authorization: string) {
        this.client = got.extend({
            prefixUrl: "https://arca.live",
            cookieJar: this.cookieJar,
            headers: {
                "user-agent": "net.umanle.arca.android/0.9.705",
                "accept-encoding": "gzip",
                "x-device-token": token,
                authorization: authorization
            },
            http2: true
        });
    }
    
    public channel(channelId: string) {
        return new Channel(this.client, channelId);
    }
}