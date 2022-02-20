# react-spotify-web-playback-sdk-headless

A headless react library for the Spotify web playback SDK. Quite a name

## Why

This library was build for the Kokopelli project, since the regular Spotify SDK is not very user friendly.
It does not support playing music directly and it cannot refresh access tokens.
This library adds simple functions to do exactly that.

## How to use

Usage is very simple, just add this to your project, preferably as high in the tree as possible (this is since re-renders can and will break the SDK)
```jsx
import SpotifyWebPlayback from 'react-spotify-web-playback-sdk-headless'

const ACCESS_TOKEN="<access_token>"

const Index = () => {
  const player = useRef<SpotifyWebPlayback>(null)

  const playSong = () => {
    player.current?.play('spotify:track:4k1OADTXVmuABulPYY9IIu')
  }

  return <div>
    <button onClick={playSong}>
      Play a song
    </button>

    <SpotifyWebPlayback accessToken={ACCESS_TOKEN} name="cool player" volume={50}>
  </div>
}
```
The code above will initialize the player (if the token is valid) and pressing the button will play a song from the browser!

To access methods use the ref as seen above.

## Props

No props are required, but the player will not play when some combinations are not present.

| Prop | Value | Description |
|------|-------|-------------|
| accessToken | string | The spotify access token to use, required the streaming scope. |
| refreshToken| string | The spotify refresh token to use, this is only used when refreshTokenAutomatically is present |
| name | string | Name for the player (as seen from Spotify) |
| volume | number | The volume of the player, from 1 to 100. This can be changed at all times |
| logging | boolean | To enable logging |
| debug | boolean | To enable debug logging, this is quite spammy |
| refreshTokenAutomatically | boolean | To automatically refresh the accessToken, this requires refreshTokenUrl and refreshToken|
| refreshTokenUrl | string | The URL running the token server, see below |
| getOAuthToken | (cb: (token: string) => void) => void | This function is called by the SDK when it needs a fresh token, this can be used to implement token refreshing manually |

## Listeners

The SDK has a lot of event you can listen to, so this is also exposed by this library.
You can add a listener by passing it as a prop to the SpotifyWebPlayback object.
For more information see the [Spotify Developer Reference](https://developer.spotify.com/documentation/web-playback-sdk/reference/)

| Listener | Description |
|----------|----------|
| onReady | Is called when the player is ready |
| onNotReady | Is called when something went horribly wrong with initialization |
| onPlayerStateChanged | The most interesting event, is called when a song is started, paused, finished etc. |
| onInitializationError | Speaks for itself |
| onAuthenticationError | Speaks for itself |
| onAccountError | When a Spotify account doesnt have a premium subscription |
| onPlaybackError | Speaks for itself |
| onAutoplayFailed | Happens when the browser denies autoplay, this can be solved by adding a button that starts playback, or enabling autoplay |
| songFinished | New listener, is called when a song is finished with playing |
| onTokenRefresh | New listener, is called when a token is refreshed |

## Class methods

Most functions are from the SDK and docs for that can be found on the [Spotify Developer Reference](https://developer.spotify.com/documentation/web-playback-sdk/reference/).
But there are some new methods:

| Method | Type | Description |
| setVolume | (volume: number) => void | Change the volume of the player |
| play | (spotifyId: string) => void | Play a song on the player, takes a spotify id in the `spotify:track:[id]` format, or with just the id |
| queueSongs | (spotifyIds: string[]) => void | Adds a list of songs to the current playback queue, same format as SpotifyWebPlayback#play  |


## Automatic Token Refreshing

Token refreshing has to be done by a server, which can be found [here](https://github.com/KokopelliMusic/spotify_auth_api)
To use this you need to add some props to your object. If you use this then you cannot use getOAuthToken
```jsx
<SpotifyWebPlayback accessToken="..." refreshToken="..." refreshTokenAutomatically refreshTokenUrl="<url_to_server>/spotify/auth/refresh" />
```
For an example of this check the 'test' story in the repo