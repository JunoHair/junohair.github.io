const generalW = document.querySelectorAll('[id^=icon_g]');
const rainW = document.querySelectorAll('[id^=icon_r]');
const thunderW = document.querySelectorAll('[id^=icon_t]');
const arrWeather = [generalW, rainW, thunderW];

const whatW = Math.floor(Math.random() * 3);
arrWeather[whatW].forEach((v) => {
    v.classList.remove('hide');
    v.classList.add('show');
})