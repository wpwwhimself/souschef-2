import { getKey } from "./Storage"

/**
 * The wrapper for GET requests
 * @param storageKeysForApi An array of 3 values: 1) storage key for URL head, 2) storage key for password, 3) auth API key
 * @param URLTail The rest of URL
 * @param params Request parameters
 * @returns
 */
export const rqGet = (keys = ["dbUrl", "magicWord", "magic_word"], URLTail: string, params = {}) =>
  getKey(keys[0]).then(URLHead => getKey(keys[1]).then(password => {
    params[keys[2]] = password;
    return fetch(URLHead + URLTail + "?" + new URLSearchParams(params))
      .then(res => res.json())
  }))

/**
 * The wrapper for POST requests
 * @param storageKeysForApi An array of 3 values: 1) storage key for URL head, 2) storage key for password, 3) auth API key
 * @param URLTail The rest of URL
 * @param params Request parameters
 * @returns
 */
export const rqPost = (keys = ["dbUrl", "magicWord", "magic_word"], URLTail: string, params = {}) =>
  getKey(keys[0]).then(URLHead => getKey(keys[1]).then(password => {
    params[keys[2]] = password;
    return fetch(URLHead + URLTail, {
      method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params)
    }).then(res => res.json())
  }))

export const rqPatch = (keys = ["dbUrl", "magicWord", "magic_word"], URLTail: string, params = {}) =>
  getKey(keys[0]).then(URLHead => getKey(keys[1]).then(password => {
    params[keys[2]] = password;
    return fetch(URLHead + URLTail, {
      method: "PATCH",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params)
    }).then(res => res.json())
  }))

export const rqDelete = (keys = ["dbUrl", "magicWord", "magic_word"], URLTail: string, params = {}) =>
  getKey(keys[0]).then(URLHead => getKey(keys[1]).then(password => {
    params[keys[2]] = password;
    return fetch(URLHead + URLTail, {
      method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params)
    }).then(res => res.json())
  }))
