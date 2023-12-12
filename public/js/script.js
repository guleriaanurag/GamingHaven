'use strict';



const navbar = document.querySelector("[data-navbar]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");
const navbarToggler = document.querySelector("[data-nav-toggler]");

navbarToggler.addEventListener("click", function () {
  navbar.classList.toggle("active");
  this.classList.toggle("active");
});

for (let i = 0; i < navbarLinks.length; i++) {
  navbarLinks[i].addEventListener("click", function () {
    navbar.classList.remove("active");
    navbarToggler.classList.remove("active");
  });
}



/**
 * search toggle
 */

const searchTogglers = document.querySelectorAll("[data-search-toggler]");
const searchBox = document.querySelector("[data-search-box]");

for (let i = 0; i < searchTogglers.length; i++) {
  searchTogglers[i].addEventListener("click", function () {
    searchBox.classList.toggle("active");
  });
}



/**
 * header
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

window.addEventListener("scroll", function () {
  if (window.scrollY >= 200) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
});

/**
 * Card
 */

var cards = document.querySelectorAll(".gameCardHolder");

cards.forEach(card=>{
  card.addEventListener('click',()=>{
    var gameName = card.querySelector('h2').innerText;
    // console.log(gameName);
    window.location.href = `http://localhost:3001/gameDetails/${gameName}`;
  })
})

var searchBtn = document.querySelector('.search-submit');
searchBtn.addEventListener('click', () => {
  var gameName = document.querySelector('.search-field').value;
  window.location.href = `http://localhost:3001/searchGame/${gameName}`;
});

var productCards = document.querySelectorAll('.productCardHolder');

productCards.forEach(prodCard=>[
  prodCard.addEventListener('click',()=>{
    var prodName = prodCard.querySelector('h2').innerText;
    window.location.href = `http://localhost:3001/viewProduct/${prodName}`;
  })
])