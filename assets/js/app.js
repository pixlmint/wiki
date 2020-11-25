const $ = require('jquery');
import { encode, decode } from 'js-base64';

function requestPage(event) {
  event.preventDefault()
  app.loadPage(event.target.getAttribute('href'))

  const links = document.querySelectorAll('#nav a')
  for (let i = 0; i < links.length; i++) {
    if (links[i].getAttribute('href') === location.pathname) {
      links[i].classList.add('active')
    } else {
      links[i].classList.remove('active')
    }
  }
}

class App {
  constructor() {
    this.nav = []
    this.loadedPages = {}
    this.content = document.querySelector('article')
  }

  loadPage(page) {
    this.content.querySelector('#article-content').innerHTML = '';
    addLoadingIcon(this.content.querySelector('#article-content'))
    history.pushState({}, '', page)

    if (!(page in this.loadedPages)) {
      fetch('/pico' + page)
        .then((response) => response.text())
        .then(function (data) {
          console.log(data)
          try {
            data = JSON.parse(data)
          } catch (e) {
            console.log(e)
            data = { title: '500', content: 'There was an error' }
          }
          if (data.description === '') {
            data.description = 'Welcome to my personal wiki'
          }
          data.content = data.content.replaceAll('&gt;', '>')
          data.content = data.content.replaceAll('&lt;', '<')
          app.loadedPages[page] = data
          app.printPage(data)
        })
    } else {
      this.printPage(this.loadedPages[page])
    }
  }

  printPage(jsonPage) {
    this.content.querySelector('.js-article-title').innerText = jsonPage.title
    this.content.querySelector('#article-content').innerHTML = decode(
      jsonPage.content,
    )
    document.title = jsonPage.title + ' · Wiki'
    document.querySelector('meta[name="description"]').remove()
    document.querySelector('head').innerHTML +=
      '<meta name="description" content="' + jsonPage.description + '">'
    document
      .querySelector('#edit-link')
      .setAttribute(
        'href',
        '/admin/edit?file=' +
          jsonPage.file.substring(1) +
          '&location=' +
          location.pathname,
      )
    this.printPageNav()
  }

  printPageNav() {
    const nav = document.querySelector('nav#page-menu ul')
    nav.innerHTML = ''

    $('h1,h2,h3,h4').each(function () {
      this.setAttribute('id', encodeURI(this.innerText))
      const level = parseInt(this.tagName.substring(1))
      const padding = Math.abs(level - 2) * 10

      nav.innerHTML +=
        '<li><a class="nav-link" style="padding-left: ' +
        padding +
        'px; width: calc(100% - ' +
        padding +
        'px) !important" href="#' +
        encodeURI(this.innerText) +
        '">' +
        this.innerText +
        '</a></li>'
    })
  }

  loadNav() {
    fetch('/pico/nav')
      .then((response) => response.text())
      .then(function (data) {
        document.querySelector('nav#site-nav ul').outerHTML = data
        document.querySelectorAll('nav ul#nav a').forEach(function (link) {
          link.onclick = function (event) {
            requestPage(event)
          }
        })
      })
  }
}

function addLoadingIcon(element) {
  let icon = "<div class='loader-wrapper'><div class='loader'></div></div>"
  element.innerHTML += icon
}

function removeLoadingIcon(element) {
  element.querySelector('.loader-wrapper').remove()
}

const app = new App()
app.loadNav()
app.loadPage(location.pathname)

window.onscroll = function (event) {
  getHeadingsInView()
}

function getHeadingsInView() {
  let eleFound = false
  $('h1,h2,h3,h4').each(function () {
    try {
      document
        .querySelector('[href="#' + this.id + '"]')
        .classList.remove('active')
    } catch (e) {}
    if (this.getBoundingClientRect().y >= window.scrollY && !eleFound) {
      eleFound = true
      let link = document.querySelector('[href="#' + this.id + '"]')
      // if (link.scrollIntoViewIfNeeded !== undefined) {
      //   link.scrollIntoViewIfNeeded()
      // } else {
      //   link.scrollIntoView()
      // }
      link.classList.add('active')
    }
  })
}

function toggleMainNav() {
  const hamburg = document.getElementById('hamburg')
  const menu = document.querySelector('nav#site-nav')
  if (hamburg.checked) {
    menu.classList.remove('collapsed')
  } else {
    menu.classList.add('collapsed')
  }
}
