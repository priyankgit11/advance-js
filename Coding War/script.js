//character-api : https://swapi.dev/api/people
//characterimage-api : https://starwars-visualguide.com/assets/img/characters/4.jpg
const imgURL = " https://starwars-visualguide.com/assets/img/characters/";
const baseURL = "https://swapi.dev/api/people";

const btnPrev = document.querySelector(".btn-prev");
const btnNext = document.querySelector(".btn-next");
const cardList = document.querySelector(".cards");

const model = document.querySelector(".model");
const modelContent = document.querySelector(".model .model-content");
const closeModel = document.querySelector(".close");

const charName = document.querySelector(".char-name");
const charImg = document.getElementById("charImg");
const [birthyear, gender, species, homeworld, films] =
  document.querySelectorAll(".stats-data");

const characters = [];
let currentPage = 1;
let totalPages = 0;

btnNext.addEventListener("click", function () {
  currentPage += 1;
  init();
});

btnPrev.addEventListener("click", function () {
  currentPage -= 1;
  init();
});

closeModel.addEventListener("click", function () {
  model.classList.add("hidden");
  charName.innerHTML = "";
  modelContent.classList.add("hidden");
});

const getCharacters = async function (url, errorMsg = "Characters not found") {
  return fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);
      return response.json();
    })
    .then(async (data) => {
      totalPages = parseInt(data.count / 10) + 1;
      characters.push(...data.results);
      if (data.next) getCharacters(data.next);
    });
};

const getDetails = async function (url, errorMsg = "Something went wrong") {
  return fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);
      return response.json();
    })
    .then((data) => {
      if (!data.name) return data.title;
      return data.name;
    });
};

const getFilms = async function (films) {
  try {
    const charFilms = await Promise.all(
      films.map(async (f) => {
        const t = await getDetails(f, "Film not found");
        return t;
      })
    );
    return charFilms;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const show = function (page) {
  const range = {
    low: (page - 1) * 10,
    high: page * 10,
  };

  cardList.innerHTML = "";
  let html = "";
  characters
    .filter((_, i) => i >= range.low && i < range.high)
    .forEach((el, i) => {
      html += `<div class="card" id="${
        range.low + i
      }" onclick="openModel(this)">
                  <img id="${range.low + i}" class="picture" src='${imgURL}${
        range.low + i + 1 < 17 ? range.low + i + 1 : range.low + i + 2
      }.jpg' />
                  <div class="title">${el.name}</div>
              </div>`;
    });

  cardList.insertAdjacentHTML("afterbegin", html);
};

const manageButtons = function (currPage) {
  if (currPage === 1) {
    btnNext.classList.remove("hidden");
    btnPrev.classList.add("hidden");
  } else if (currPage === totalPages) {
    btnPrev.classList.remove("hidden");
    btnNext.classList.add("hidden");
  } else {
    btnPrev.classList.remove("hidden");
    btnNext.classList.remove("hidden");
  }
};

const load = async function () {
  await getCharacters(baseURL);
  init();
};

const init = function () {
  show(currentPage);
  manageButtons(currentPage);
};
load();

const showDetails = async function (obj) {
  const char = characters[obj];

  if (char.homeworld.includes("https")) {
    char.homeworld = await getDetails(char.homeworld, "HomeWorld not found");

    char.species =
      char.species.length === 0
        ? "unknown"
        : await getDetails(char.species[0], "HomeWorld not found");

    char.films = await getFilms(char.films, "Films not found");
  }

  charImg.src = `${imgURL}/${+obj + 1 < 17 ? +obj + 1 : +obj + 2}.jpg`;

  modelContent.classList.remove("hidden");

  charName.innerHTML = char.name;

  birthyear.innerHTML = char.birth_year;

  gender.innerHTML = char.gender;

  species.innerHTML = char.species;

  films.innerHTML = char.films.join(", ");

  homeworld.innerHTML = char.homeworld;
};

const openModel = async function (obj) {
  model.classList.remove("hidden");
  await showDetails(obj.id);
};
