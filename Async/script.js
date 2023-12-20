'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

///////////////////////////////////////
const renderError = function (msg) {
  countriesContainer.insertAdjacentHTML('beforeend', msg);
  countriesContainer.style.opacity = 1;
};

const renderData = function (data, className = '') {
  const html = `
        <article class="country ${className}">
          <img class="country__img" src="${data.flags.png}" />
          <div class="country__data">
            <h3 class="country__name">${data.name.common}</h3>
            <h4 class="country__region">${data.region}</h4>
            <p class="country__row"><span>👫</span>${(
              data.population / 1000000
            ).toFixed(2)}</p>
            <p class="country__row"><span>🗣️</span>${
              data.languages[Object.keys(data.languages)[0]]
            }</p>
            <p class="country__row"><span>💰</span>${
              data.currencies[Object.keys(data.currencies)[0]].name
            }</p>
          </div>
        </article>
`;
  countriesContainer.insertAdjacentHTML('beforeend', html);
  countriesContainer.style.opacity = 1;
};

// OLD METHOD XMLHTTPREQUEST
// const getCountryData = function (country) {
//   const request = new XMLHttpRequest();
//   request.open('GET', `https://restcountries.com/v3.1/name/${country}`);
//   request.send();

//   request.addEventListener('load', function () {
//     const [data] = JSON.parse(this.responseText);
//     console.log(data);
//     renderData(data);
//     const [neighbour] = data.borders;
//     if (!neighbour) return;
//     console.log(neighbour);
//     const request2 = new XMLHttpRequest();
//     request2.open(
//       'GET',
//       `https://restcountries.com/v3.1/alpha?codes=${neighbour}`
//     );
//     console.log(`https://restcountries.com/v3.1/alpha?codes=${neighbour}`);
//     request2.send();
//     request2.addEventListener('load', function () {
//       const [data2] = JSON.parse(this.responseText);
//       console.log(data2);
//       renderData(data2, 'neighbour');
//     });
//   });
// };

// NEW METHOD fetch, promise
const getJson = function (url, errMsg = 'Something went wrong') {
  return fetch(url).then(response => {
    if (!response.ok) throw new Error(`${errMsg} (${response.status})`);
    return response.json();
  });
};

const getCountryData = function (country) {
  getJson(`https://restcountries.com/v3.1/name/${country}`, 'Country not found')
    .then(data => {
      renderData(data[0]);
      const neighbour = data[0].borders[0];
      if (!neighbour) throw new Error('Neighbour not found');
      return getJson(
        `https://restcountries.com/v3.1/alpha?codes=${neighbour}`,
        'Country not found'
      );
    })
    .then(data => renderData(data[0], 'neighbour'))
    .catch(err => {
      renderError(`Something went wrong ${err.message}. Try Again!`);
    })
    .finally(() => {
      countriesContainer.style.opacity = 1;
    });
};

btn.addEventListener('click', () => {
  getCountryData('portugal');
});

// Event Loop Practice
console.log('Test start');
//Event Loop
setTimeout(() => {
  console.log('Timer Completed');
}, 0);
// Microtask
// Microtask Queue Priority higher than Event loop
Promise.resolve('Promise Resolved 1').then(res => console.log(res));
Promise.resolve('Promise Resolved 2').then(res => console.log(res));
console.log('Test ended');

// ASYNC AWAIT
const getPosition = async function () {
  const pos = navigator.geolocation.getCountryData();
  return pos;
};

const whereAmI = async function () {
  try {
    const pos = await getPosition();
    const { latitude: lat, longitude: lng } = pos.coords;

    //Reverse geocoding
    const resGeo = await fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`);
    if (!resGeo.ok) throw new Error('Problem getting location data');
    const dataGeo = await resGeo.json();
    console.log(dataGeo);

    //Country data
    const res = await fetch(
      `https://restcountries.eu/rest/v2/name${dataGeo.country}`
    );
    if (!res.ok) throw new Error('Problem getting country');
    const data = await res.json();
    console.log(data);
    renderData(data[0]);
  } catch (err) {
    console.error(`${err}`);
    renderError(`Something went wrong ${err.message}`);
  }
};
whereAmI();
console.log('First');
