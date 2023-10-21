import axios from "axios"

export const rqGet = (URL: string, params?: any) =>
  axios.get(URL + "?" + new URLSearchParams(params)).then(res => res.data)

export const rqPost = (URL: string, params?: any) =>
  axios.post(URL, params).then(res => res.data)

export const rqPatch = (URL: string, params?: any) =>
  axios.patch(URL, params).then(res => res.data)

export const rqDelete = (URL: string, params?: any) =>
  axios.delete(URL, params).then(res => res.data)
