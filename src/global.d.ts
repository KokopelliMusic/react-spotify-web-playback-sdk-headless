declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
  }

  namespace Node {
    interface ProcessEnv {
      REACT_APP_SPOTIFY_TOKEN: string
    }
  }
}