// import axios from "axios"

export const rqGet = (URL: string, params?: any) =>
  // axios.get(URL + "?" + new URLSearchParams(params)).then(res => res.data)
  fetch(URL + "?" + new URLSearchParams(params))
    .then(res => res.json())

export const rqPost = (URL: string, params?: any) =>
  // axios.post(URL, params).then(res => res.data)
  fetch(URL, {
    method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params)
  }).then(res => res.json())

export const rqPatch = (URL: string, params?: any) =>
  // axios.patch(URL, params).then(res => res.data)
  fetch(URL, {
    method: "PATCH",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params)
  }).then(res => res.json())

export const rqDelete = (URL: string, params?: any) =>
  // axios.delete(URL, params).then(res => res.data)
  fetch(URL, {
    method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params)
  }).then(res => res.json())
