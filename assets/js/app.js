function reindex() {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', '/search')
  xhr.send()
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let response = {}
        try {
          response = JSON.parse(xhr.responseText)
        } catch (e) {
          console.log(e)
          return
        }

        alert(response.message)
      }
    }
  }
}

global.reindex = reindex
