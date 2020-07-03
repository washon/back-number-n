import axios from 'axios'

// flatのpolyfillがieとedgeに必要だった...
if (!Array.prototype.flat) {
  Array.prototype.flat = function (depth) {
    const flattend = [];
    (function flat(array, depth) {
      for (const el of array) {
        if (Array.isArray(el) && depth > 0) {
          flat(el, depth - 1)
        } else {
          flattend.push(el)
        }
      }
    })(this, Math.floor(depth) || 1)
    return flattend
  }
}

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
