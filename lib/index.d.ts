/// <reference types="spotify-web-playback-sdk" />
/// <reference types="node" />
import React from 'react';
interface SpotifyWebPlaybackProps {
    accessToken?: string;
    refreshToken?: string;
    name?: string;
    volume?: number;
    logging?: boolean;
    debug?: boolean;
    refreshTokenAutomatically?: boolean;
    refreshTokenUrl?: string;
    getOAuthToken?: (cb: (token: string) => void) => void;
    onTokenRefresh?: (token: string) => void;
    onReady?: Spotify.PlaybackInstanceListener;
    onNotReady?: Spotify.PlaybackInstanceListener;
    onPlayerStateChanged?: Spotify.PlaybackStateListener;
    onInitializationError?: Spotify.ErrorListener;
    onAuthenticationError?: Spotify.ErrorListener;
    onAccountError?: Spotify.ErrorListener;
    onPlaybackError?: Spotify.ErrorListener;
    onAutoplayFailed?: Spotify.EmptyListener;
    songFinished?: () => void;
}
interface SpotifyWebPlaybackState {
    isActive: boolean;
    player: Spotify.Player | null;
    isPaused: boolean;
    currentTrack: Spotify.Track | null;
    deviceId: string;
    tokenRefreshInterval: NodeJS.Timer | null;
}
export default class SpotifyWebPlayback extends React.Component<SpotifyWebPlaybackProps> {
    state: SpotifyWebPlaybackState;
    accessToken: string;
    tokenExpiration: Date;
    constructor(props: SpotifyWebPlaybackProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: SpotifyWebPlaybackProps): void;
    shouldComponentUpdate(nextProps: SpotifyWebPlaybackProps, nextState: SpotifyWebPlaybackState): boolean;
    /**
     * Set the volume of the player
     * @param volume The volume to set the player to. This is a number between 1 and 100
    */
    setVolume: (volume: number) => void;
    /**
     * Play a song
     * @param spotifyId The spotify id to play, this can be in the format spotify:track:[id] or just [id]
     *
     * [Spotify Docs](https://developer.spotify.com/documentation/web-api/reference/#/operations/start-a-users-playback)
     */
    play(spotifyId: string): void;
    /**
     * Resume/pause the local playback.
     *
     * [Spotify Docs](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-spotify-player-toggleplay)
     */
    togglePlay(): void;
    /**
     * Pause the local playback.
     *
     * [Spotify Docs](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-spotify-player-pause)
     */
    pause(): void;
    /**
     * Resume the local playback.
     *
     * [Spotify Docs](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-spotify-player-resume)
     */
    resume(): void;
    /**
     * Seek to a position in the current track in local playback.
     *
     * [Spotify Docs](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-spotify-player-seek)
     */
    seek(position: number): void;
    /**
     * Queue up one or multiple tracks to the users playback queue
     * @param spotifyIds the spotify ids of the tracks to queue, this can be any amount
     *
     * [Spotify Docs](https://developer.spotify.com/documentation/web-api/reference/#/operations/add-to-queue)
     */
    queueSongs(spotifyIds: string[]): void;
    /**
     * Collect metadata on local playback.
     * @returns Promise<Spotify.PlayerState | null> Returns a Promise. It will return either a Spotify.PlayerState object or null depending on if the user is successfully connected.
     *
     * [Spotify Docs](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-spotify-player-getcurrentstate)
     */
    getCurrentState(): Promise<Spotify.PlaybackState | null> | undefined;
    private fetchSpotify;
    private refreshAccessToken;
    private fixSpotifyId;
    private loadSpotify;
    private log;
    private debug;
    private error;
    render(): null;
}
export {};
