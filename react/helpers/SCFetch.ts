import axios from "axios"

export const rqGet = (URL: string, params?: any) =>
  axios.get(URL + "?" + new URLSearchParams(params))

export const rqPost = (URL: string, params?: any) =>
  axios.post(URL, params)

export const rqPatch = (URL: string, params?: any) =>
  axios.patch(URL, params)

export const rqDelete = (URL: string, params?: any) =>
  axios.delete(URL, params)
