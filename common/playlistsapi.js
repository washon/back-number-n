import axios from 'axios'

export async function getPlaylists(apiUrl, params) {
  try {
    const res = await axios.get(`${apiUrl}/playlists`, { params: params })
    return res.data
  } catch (error) {
    console.error(error)
  }
  return []
}

export async function searchPlaylists(apiUrl, query) {
  try {
    const res = await axios.get(`${apiUrl}/search`, { params: { q: query } })
    return res.data
  } catch (error) {
    console.error(error)
  }
  return []
}
