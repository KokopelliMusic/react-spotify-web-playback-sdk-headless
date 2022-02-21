"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
// Interval of time in milliseconds to check if the token needs to be refreshed
var TOKEN_CHECK_INTERVAL = 1000 * 60 * 10;
// Interval of time in milliseconds to refresh the token
var TOKEN_REFRESH_INTERVAL = 1000 * 60 * 30;
var SpotifyWebPlayback = /** @class */ (function (_super) {
    __extends(SpotifyWebPlayback, _super);
    function SpotifyWebPlayback(props) {
        var _a;
        var _this = _super.call(this, props) || this;
        _this.state = {
            player: null,
            isPaused: false,
            isActive: false,
            currentTrack: null,
            deviceId: '',
            tokenRefreshInterval: null
        };
        _this.accessToken = (_a = _this.props.accessToken) !== null && _a !== void 0 ? _a : '';
        _this.tokenExpiration = new Date();
        /**
         * Set the volume of the player
         * @param volume The volume to set the player to. This is a number between 1 and 100
        */
        _this.setVolume = function (volume) {
            var _a;
            (_a = _this.state.player) === null || _a === void 0 ? void 0 : _a.setVolume(normalizeVolume(volume));
        };
        if (_this.props.refreshTokenAutomatically !== undefined && _this.props.refreshTokenUrl === undefined) {
            throw new Error('[Spotify Web Playback SDK] refreshTokenUrl is required when refreshTokenAutomatically is set');
        }
        if (_this.props.refreshTokenUrl !== undefined && _this.props.refreshTokenAutomatically === undefined) {
            throw new Error('[Spotify Web Playback SDK] refreshTokenAutomatically is required when refreshTokenUrl is set');
        }
        if (_this.props.refreshTokenAutomatically !== undefined && _this.props.getOAuthToken !== undefined) {
            throw new Error('[Spotify Web Playback SDK] getOAuthToken cannot be defined when refreshTokenAutomatically is set');
        }
        if (_this.props.refreshTokenAutomatically === undefined && _this.props.getOAuthToken === undefined) {
            _this.log('getOAuthToken and refrweTokenAutomatically are not defined, using accessToken. This does mean that this token will expire in 1 hour.');
        }
        if (_this.props.refreshTokenAutomatically) {
            if (!_this.props.accessToken || !_this.props.refreshToken) {
                throw new Error('[Spotify Web Playback SDK] You must provide an access token and refresh token');
            }
            _this.state.tokenRefreshInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.refreshAccessToken()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); }, TOKEN_CHECK_INTERVAL);
        }
        return _this;
    }
    SpotifyWebPlayback.prototype.componentDidMount = function () {
        var _this = this;
        window.onSpotifyWebPlaybackSDKReady = function () {
            var v = normalizeVolume(_this.props.volume || 0.5);
            var self = _this;
            var p = new Spotify.Player({
                name: _this.props.name || 'react-spotify-web-playback-sdk-headless',
                getOAuthToken: _this.props.getOAuthToken || (function (cb) {
                    self.debug('Calling getOAuthToken');
                    cb(self.accessToken);
                }),
                volume: v,
            });
            p.addListener('ready', function (e) {
                _this.log('Ready with Device ID', e.device_id);
                _this.setState({ deviceId: e.device_id });
                if (_this.props.onReady)
                    _this.props.onReady(e);
            });
            p.addListener('not_ready', function (e) {
                _this.log('Device ID has gone offline', e.device_id);
                if (_this.props.onNotReady)
                    _this.props.onNotReady(e);
            });
            p.addListener('initialization_error', function (e) {
                _this.error('Initialization Error', e.message);
                if (_this.props.onInitializationError)
                    _this.props.onInitializationError(e);
            });
            p.addListener('authentication_error', function (e) {
                _this.error('Authentication Error', e.message);
                if (_this.props.onAuthenticationError)
                    _this.props.onAuthenticationError(e);
            });
            p.addListener('account_error', function (e) {
                _this.error('Account Error', e.message);
                if (_this.props.onAccountError)
                    _this.props.onAccountError(e);
            });
            p.addListener('autoplay_failed', function () {
                _this.error('Autoplay failed');
                if (_this.props.onAutoplayFailed)
                    _this.props.onAutoplayFailed();
            });
            p.addListener('playback_error', function (e) {
                _this.error('Playback Error', e.message);
                if (_this.props.onPlaybackError)
                    _this.props.onPlaybackError(e);
            });
            p.addListener('player_state_changed', function (e) {
                if (e.track_window.previous_tracks.find(function (x) { return x.id === e.track_window.current_track.id; })
                    && !_this.state.isPaused
                    && e.paused) {
                    if (_this.props.songFinished)
                        _this.props.songFinished();
                }
                _this.setState({
                    track: e.track_window.current_track,
                    isPaused: e.paused,
                    isActive: !!e
                });
                if (_this.props.onPlayerStateChanged)
                    _this.props.onPlayerStateChanged(e);
            });
            // Connect to the player!
            p.connect()
                .then(function () { return _this.setState({
                player: p,
                isActive: true,
            }); });
        };
        this.loadSpotify();
    };
    SpotifyWebPlayback.prototype.componentDidUpdate = function (prevProps) {
        var _a;
        if (prevProps.volume !== this.props.volume) {
            (_a = this.state.player) === null || _a === void 0 ? void 0 : _a.setVolume(normalizeVolume(this.props.volume || 20));
        }
    };
    SpotifyWebPlayback.prototype.shouldComponentUpdate = function (nextProps, nextState) {
        return false;
    };
    /**
     * Play a song
     * @param spotifyId The spotify id to play, this can be in the format spotify:track:[id] or just [id]
     *
     * [Spotify Docs](https://developer.spotify.com/documentation/web-api/reference/#/operations/start-a-users-playback)
     */
    SpotifyWebPlayback.prototype.play = function (spotifyId) {
        var _this = this;
        var id = this.fixSpotifyId(spotifyId);
        if (!this.state.player)
            return;
        this.fetchSpotify("https://api.spotify.com/v1/me/player/play?device_id=".concat(this.state.deviceId), 'PUT', JSON.stringify({ uris: [id] }))
            .catch(function (err) {
            _this.error('Play Error', err);
        });
    };
    /**
     * Resume/pause the local playback.
     *
     * [Spotify Docs](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-spotify-player-toggleplay)
     */
    SpotifyWebPlayback.prototype.togglePlay = function () {
        var _a;
        (_a = this.state.player) === null || _a === void 0 ? void 0 : _a.togglePlay();
    };
    /**
     * Pause the local playback.
     *
     * [Spotify Docs](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-spotify-player-pause)
     */
    SpotifyWebPlayback.prototype.pause = function () {
        var _a;
        (_a = this.state.player) === null || _a === void 0 ? void 0 : _a.pause();
    };
    /**
     * Resume the local playback.
     *
     * [Spotify Docs](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-spotify-player-resume)
     */
    SpotifyWebPlayback.prototype.resume = function () {
        var _a;
        (_a = this.state.player) === null || _a === void 0 ? void 0 : _a.resume();
    };
    /**
     * Seek to a position in the current track in local playback.
     *
     * [Spotify Docs](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-spotify-player-seek)
     */
    SpotifyWebPlayback.prototype.seek = function (position) {
        var _a;
        (_a = this.state.player) === null || _a === void 0 ? void 0 : _a.seek(position);
    };
    /**
     * Queue up one or multiple tracks to the users playback queue
     * @param spotifyIds the spotify ids of the tracks to queue, this can be any amount
     *
     * [Spotify Docs](https://developer.spotify.com/documentation/web-api/reference/#/operations/add-to-queue)
     */
    SpotifyWebPlayback.prototype.queueSongs = function (spotifyIds) {
        var _this = this;
        var ids = spotifyIds.map(function (id) { return _this.fixSpotifyId(id); });
        if (!this.state.player)
            return;
        this.fetchSpotify("https://api.spotify.com/v1/me/player/queue?device_id=".concat(this.state.deviceId), 'PUT', JSON.stringify({ uris: ids }))
            .catch(function (err) {
            _this.error('Queueing Error', err.message);
        });
    };
    /**
     * Collect metadata on local playback.
     * @returns Promise<Spotify.PlayerState | null> Returns a Promise. It will return either a Spotify.PlayerState object or null depending on if the user is successfully connected.
     *
     * [Spotify Docs](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-spotify-player-getcurrentstate)
     */
    SpotifyWebPlayback.prototype.getCurrentState = function () {
        var _a;
        return (_a = this.state.player) === null || _a === void 0 ? void 0 : _a.getCurrentState();
    };
    SpotifyWebPlayback.prototype.fetchSpotify = function (url, method, body) {
        return fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer ".concat(this.accessToken),
            },
            body: body
        });
    };
    SpotifyWebPlayback.prototype.refreshAccessToken = function () {
        var _this = this;
        // if the token is of unknown age, refresh it
        // if the token is older than the max age, refresh it
        this.debug('Checking Spotify access token');
        this.debug('Token Expiration: ' + this.tokenExpiration.getTime());
        this.debug('Current Time: ' + new Date().getTime());
        if (this.tokenExpiration.getTime() < (new Date()).getTime()) {
            this.debug('Spotify access token is old, refreshing');
            fetch(this.props.refreshTokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: this.props.refreshToken })
            })
                .then(function (res) { return res.json(); })
                .then(function (res) {
                if (_this.props.onTokenRefresh)
                    _this.props.onTokenRefresh(res.access_token);
                _this.debug(res);
                _this.accessToken = res.access_token;
                _this.tokenExpiration = new Date(Date.now() + TOKEN_REFRESH_INTERVAL);
            })
                .catch(this.error);
        }
        else {
            this.debug('Token is fine');
        }
    };
    SpotifyWebPlayback.prototype.fixSpotifyId = function (id) {
        if (!id.startsWith('spotify:'))
            return "spotify:track:".concat(id);
        return id;
    };
    SpotifyWebPlayback.prototype.loadSpotify = function () {
        // Do not load the lib twice
        if (typeof Spotify !== 'undefined')
            return;
        var script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);
    };
    SpotifyWebPlayback.prototype.log = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        if (this.props.logging !== false)
            console.log.apply(console, __spreadArray(['[Spotify web playback SDK]'], msg, false));
    };
    SpotifyWebPlayback.prototype.debug = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        if (this.props.logging !== false || this.props.debug !== false) {
            console.log.apply(console, __spreadArray(['[Spotify web playback SDK] [DEBUG]'], msg, false));
        }
    };
    SpotifyWebPlayback.prototype.error = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        if (this.props.logging !== false)
            console.error.apply(console, __spreadArray(['[Spotify web playback SDK]'], msg, false));
    };
    SpotifyWebPlayback.prototype.render = function () {
        return null;
    };
    return SpotifyWebPlayback;
}(react_1.default.Component));
exports.default = SpotifyWebPlayback;
var normalizeVolume = function (value) {
    if (value > 1) {
        return value / 100;
    }
    return value;
};
