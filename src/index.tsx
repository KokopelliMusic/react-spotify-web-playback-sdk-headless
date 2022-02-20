import React from 'react'
import { normalizeVolume } from './util'

interface SpotifyWebPlaybackProps {
  accessToken?:  string
  refreshToken?: string

  name?:    string
  volume?:  number
  logging?: boolean

  refreshTokenAutomatically?: boolean
  refreshTokenUrl?:           string
  getOAuthToken?:             (cb: (token: string) => void) => void 
  
  onReady?:               Spotify.PlaybackInstanceListener
  onNotReady?:            Spotify.PlaybackInstanceListener
  onPlayerStateChanged?:  Spotify.PlaybackStateListener
  onInitializationError?: Spotify.ErrorListener
  onAuthenticationError?: Spotify.ErrorListener
  onAccountError?:        Spotify.ErrorListener
  onPlaybackError?:       Spotify.ErrorListener
  onAutoplayFailed?:      Spotify.EmptyListener

  songFinished?:          () => void
}

interface SpotifyWebPlaybackState {
  isActive: boolean
  player: Spotify.Player | null
  isPaused: boolean
  currentTrack: Spotify.Track | null
  deviceId: string

  accessToken: string
  refreshToken: string
  tokenExpiration: Date
  tokenRefreshInterval: NodeJS.Timer | null
}

// Interval of time in milliseconds to check if the token needs to be refreshed
const TOKEN_CHECK_INTERVAL = 1000 * 60 * 10

// Interval of time in milliseconds to refresh the token
const TOKEN_REFRESH_INTERVAL = 1000 * 60 * 30

class SpotifyWebPlayback extends React.Component<SpotifyWebPlaybackProps> {

  state: SpotifyWebPlaybackState = {
    player: null,
    isPaused: false,
    isActive: false,
    currentTrack: null,
    deviceId: '',
    accessToken: '',
    refreshToken: '',
    tokenExpiration: new Date(),
    tokenRefreshInterval: null
  }

  constructor(props: SpotifyWebPlaybackProps) {
    super(props)
    if (this.props.refreshTokenAutomatically !== undefined && this.props.refreshTokenUrl === undefined) {
      throw new Error('[Spotify Web Playback SDK] refreshTokenUrl is required when refreshTokenAutomatically is set')
    }

    if (this.props.refreshTokenUrl !== undefined && this.props.refreshTokenAutomatically === undefined) {
      throw new Error('[Spotify Web Playback SDK] refreshTokenAutomatically is required when refreshTokenUrl is set')
    }

    if (this.props.refreshTokenAutomatically !== undefined && this.props.getOAuthToken !== undefined) {
      throw new Error('[Spotify Web Playback SDK] getOAuthToken cannot be defined when refreshTokenAutomatically is set')
    }

    if (this.props.refreshTokenAutomatically === undefined && this.props.getOAuthToken === undefined) {
      this.log('getOAuthToken and refrweTokenAutomatically are not defined, using accessToken. This does mean that this token will expire in 1 hour.')
    }

    if (this.props.refreshTokenAutomatically) {
      if (!this.props.accessToken || !this.props.refreshToken) {
        throw new Error('[Spotify Web Playback SDK] You must provide an access token and refresh token')
      }

      this.state.tokenRefreshInterval = setInterval(async () => {
        await this.refreshAccessToken()
      }, TOKEN_CHECK_INTERVAL)
      
    }

    this.state.accessToken = this.props.accessToken || ''
    this.state.refreshToken = this.props.refreshToken || ''
    this.state.tokenExpiration = this.props.refreshToken ? new Date() : new Date(0)

  }

  componentDidMount() {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const v = normalizeVolume(this.props.volume || 0.5)

      const p = new Spotify.Player({
        name: this.props.name || 'react-spotify-web-playback-sdk-headless',
        getOAuthToken: this.getOAuthToken(),
        volume: v,
      })

      p.addListener('ready', e => {
        this.log('Ready with Device ID', e.device_id)
        this.setState({ deviceId: e.device_id })
        if (this.props.onReady) this.props.onReady(e)
      })

      p.addListener('not_ready', e => {
        this.log('Device ID has gone offline', e.device_id)
        if (this.props.onNotReady) this.props.onNotReady(e)
      })
      
      p.addListener('initialization_error', e => {
        this.error('Initialization Error', e.message)
        if (this.props.onInitializationError) this.props.onInitializationError(e)
      })

      p.addListener('authentication_error', e => {
        this.error('Authentication Error', e.message)
        if (this.props.onAuthenticationError) this.props.onAuthenticationError(e)
      })

      p.addListener('account_error', e => {
        this.error('Account Error', e.message)
        if (this.props.onAccountError) this.props.onAccountError(e)
      })

      p.addListener('autoplay_failed', () => {
        this.error('Autoplay failed')
        if (this.props.onAutoplayFailed) this.props.onAutoplayFailed()
      })

      p.addListener('playback_error', e => {
        this.error('Playback Error', e.message)
        if (this.props.onPlaybackError) this.props.onPlaybackError(e)
      })

      p.addListener('player_state_changed', e => {
        p.getCurrentState()
          .then(state => {
            if (e) {
              this.setState({
                track: e.track_window.current_track,
                isPaused: e.paused
              })
            }
            // Reacts state batching will make sure this.setState is only called once
            this.setState({
              isActive: !!state
            })
          })

        if (this.props.onPlayerStateChanged) this.props.onPlayerStateChanged(e)
      })

      // Connect to the player!
      p.connect()
        .then(() => this.setState({
          player: p,
          isActive: true,
        }))
    }

    this.loadSpotify()
  }

  componentDidUpdate(prevProps: SpotifyWebPlaybackProps) {
    if (prevProps.volume !== this.props.volume) {
      this.state.player?.setVolume(normalizeVolume(this.props.volume || 20))
    }
  }

  /**
   * Play a song
   * @param spotifyId The spotify id to play, this can be in the format spotify:track:[id] or just [id]  
   *   
   * [Spotify Docs](https://developer.spotify.com/documentation/web-api/reference/#/operations/start-a-users-playback)
   */
  public play(spotifyId: string) {
    const id = this.fixSpotifyId(spotifyId)

    if (!this.state.player) return

    this.fetchSpotify(`https://api.spotify.com/v1/me/player/play?device_id=${this.state.deviceId}`, 'PUT', JSON.stringify({ uris: [id] }))
      .catch(err => {
        this.error('Play Error', err)
      })
  }

  /**
   * Resume/pause the local playback.
   *   
   * [Spotify Docs](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-spotify-player-toggleplay)
   */
  public togglePlay() {
    this.state.player?.togglePlay()
  }

  /**
   * Pause the local playback.  
   *   
   * [Spotify Docs](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-spotify-player-pause)
   */
  public pause() {
    this.state.player?.pause()
  }

  /**
   * Resume the local playback.  
   *   
   * [Spotify Docs](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-spotify-player-resume)
   */
  public resume() {
    this.state.player?.resume()
  }

  /**
   * Seek to a position in the current track in local playback.  
   *   
   * [Spotify Docs](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-spotify-player-seek)
   */
  public seek(position: number) {
    this.state.player?.seek(position)
  }

  /**
   * Queue up one or multiple tracks to the users playback queue
   * @param spotifyIds the spotify ids of the tracks to queue, this can be any amount  
   *   
   * [Spotify Docs](https://developer.spotify.com/documentation/web-api/reference/#/operations/add-to-queue)
   */
  public queueSongs(spotifyIds: string[]) {
    const ids = spotifyIds.map(id => this.fixSpotifyId(id))    

    if (!this.state.player) return

    this.fetchSpotify(`https://api.spotify.com/v1/me/player/queue?device_id=${this.state.deviceId}`, 'PUT', JSON.stringify({ uris: ids }))
      .catch(err => {
        this.error('Queueing Error', err.message)
      })
  }

  /**
   * Collect metadata on local playback.
   * @returns Promise<Spotify.PlayerState | null> Returns a Promise. It will return either a Spotify.PlayerState object or null depending on if the user is successfully connected.
   *   
   * [Spotify Docs](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-spotify-player-getcurrentstate)
   */
  public getCurrentState() {
    return this.state.player?.getCurrentState()
  }

  private fetchSpotify(url: string, method: string, body: any): Promise<Response> {
    return fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.props.accessToken}`,
      },
      body
    })
  }

  private refreshAccessToken() {
    // TODO dit testen
    // if the token is of unknown age, refresh it
    // if the token is older than the max age, refresh it
    if (!this.state.tokenExpiration || this.state.tokenExpiration < new Date(Date.now() + TOKEN_REFRESH_INTERVAL)) {
      this.log('Spotify access token is old, refreshing')

      fetch(this.props.refreshTokenUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.props.refreshToken })
      })
        .then(res => res.json())
        .then(res => {
          this.log(res)
        })
        
    }
  }

  private getOAuthToken(): (cb: (token: string) => void) => void {
    // this function is called when spotify detects when a token is expired
    // only that detection is shit so we have to do this manually
    
    // if this function is implemented elsewhere, then call that one
    if (this.props.getOAuthToken) {
      return this.props.getOAuthToken
    } 

    // else, assume we are either using this.refreshAccessToken() or that this token will expire in 1 hour
    return (cb: any) => cb(this.props.accessToken)
  }

  private fixSpotifyId(id: string) {
    if (!id.startsWith('spotify:'))
      return `spotify:track:${id}`
    return id
  }

  private loadSpotify() {
    // Do not load the lib twice
    if (typeof Spotify !== 'undefined') return

    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)
  }

  private log(...msg: string[]) {
    if (this.props.logging !== false)
      console.log('[Spotify web playback SDK]', ...msg)
  }

  private error(...msg: string[]) {
    if (this.props.logging !== false)
      console.error('[Spotify web playback SDK]', ...msg)
  }

  render() {
    return null
  }
}

export default SpotifyWebPlayback