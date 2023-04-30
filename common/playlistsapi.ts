export async function getPlaylists(apiUrl: string, query: any) {
  try {
    const _q = new URLSearchParams(query)

    const res = await fetch(`${apiUrl}/playlists?${_q}`)
    const data = await res.json()
    return data
  } catch (error) {
    console.error(error)
  }
  return []
}

export async function searchPlaylists(apiUrl: string, query: any) {
  try {
    const _q = new URLSearchParams(query)

    const res = await fetch(`${apiUrl}/search?${_q}`)
    const data = await res.json()
    return data
  } catch (error) {
    console.error(error)
  }
  return []
}

export async function getPlaylistsCount(apiUrl: string) {
  try {
    const res = await fetch(`${apiUrl}/playlists/count`)
    const data = await res.json()
    return data.count
  } catch (error) {
    console.error(error)
  }
  return []
}
