export const normalizeVolume = (value: number): number => {
  if (value > 1) {
    return value / 100
  }
  return value
}

export const fetchSpotify = (url: string, token: string, body: any): Promise<any> => {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body
  })
}