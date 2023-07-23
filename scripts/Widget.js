const generalW = document.querySelectorAll('[id^=icon_g]');
const rainW = document.querySelectorAll('[id^=icon_r]');
const thunderW = document.querySelectorAll('[id^=icon_t]');
const fineW = document.querySelectorAll('[id^=icon_f]');
const arrWeather = [generalW, rainW, thunderW, fineW];

const temp = document.querySelector('#text_info > h1');
const locate = document.getElementById('info_locate');

const whatW = Math.floor(Math.random() * arrWeather.length);
arrWeather[whatW].forEach((v) => {
    v.classList.remove('hide');
    v.classList.add('show');
});

locate.addEventListener('click', () => {
    locate.textContent = prompt('장소를 입력해주세요.');
    if (locate.textContent == '') locate.textContent = '서울 종로구';
});

temp.addEventListener('click', () => {
    temp.textContent = prompt('기온을 입력해주세요.', '℃');
    if (temp.textContent == '') temp.textContent = '-273℃';
});