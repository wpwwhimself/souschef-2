export const rqGet = (URL: string, params?: any) =>
  fetch(URL + "?" + new URLSearchParams(params))
    .then(res => res.json())

export const rqPost = (URL: string, params?: any) =>
  fetch(URL, {
    method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params)
  }).then(res => res.json())

export const rqPatch = (URL: string, params?: any) =>
  fetch(URL, {
    method: "PATCH",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params)
  }).then(res => res.json())

export const rqDelete = (URL: string, params?: any) =>
  fetch(URL, {
    method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params)
  }).then(res => res.json())
