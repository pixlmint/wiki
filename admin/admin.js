if (!referer.includes(location.hostname + '/admin')) {
  localStorage.setItem('referer', referer)
}

if (localStorage.getItem('referer') !== null) {
  document
    .getElementById('referer')
    .setAttribute('href', localStorage.getItem('referer'))
} else {
  document.getElementById('referer').setAttribute('href', location.hostname)
}

function toggleNav() {
  $('#page-menu').slideToggle()
  window.setTimeout(function () {
    let display = $('#page-menu').css('display') === 'block'
    localStorage.setItem('showPageMenu', display)
  }, 1000)
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

$(function () {
  let display = localStorage.getItem('showPageMenu')

  if (display === null) {
    display = false
  } else {
    display = display === 'true'
  }

  $('#page-menu').css('display', display ? 'block' : 'none')
})
