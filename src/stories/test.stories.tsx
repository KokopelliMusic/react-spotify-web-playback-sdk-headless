import SpotifyWebPlayback from '..'

import { ComponentStory, ComponentMeta } from '@storybook/react'
import { useRef } from 'react'

export default {
  title: 'Test',
  component: SpotifyWebPlayback,
  argTypes: {
    // variant: {
    //   options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'],
    //   control: { type: 'radio' }
    // }
  }
} as ComponentMeta<typeof SpotifyWebPlayback>

const Template: ComponentStory<typeof SpotifyWebPlayback> = (args) => {
  const player = useRef<SpotifyWebPlayback>(null)

  const playSong = () => {
    player.current?.play('spotify:track:597i9UhHbW8hHgBUp8Tm54')
  }

  return <div>
    <SpotifyWebPlayback {...args} ref={player} />

    <button onClick={playSong}>
      Play Song
    </button>

    <button onClick={() => player.current?.pause()}>
      Pause
    </button>
    <button onClick={() => player.current?.resume()}>
      Resume
    </button>
    <button onClick={() => player.current?.togglePlay()}>
      Toggle play
    </button>
    <button onClick={() => player.current?.seek(95 * 1000)}>
      Seek to 95 seconds
    </button>
  </div>

}

export const Primary = Template.bind({})

Primary.args = {
  accessToken: process.env.REACT_APP_ACCESS_TOKEN,
  refreshToken: process.env.REACT_APP_REFRSH_TOKEN,
  refreshTokenAutomatically: true,
  refreshTokenUrl: process.env.REACT_APP_TOKEN_REFRESH_URL,
  logging: true,
  volume: 20,
}