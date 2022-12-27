const backBtn = document.getElementById('back');

function makeSnowflake() {
    const snowflake = document.createElement('div');
    const realSnow = document.createElement('div');
    const weight = Math.random();
    const size = weight * 15 + 5;
    const delay = Math.random();
    const duration = (1 - weight) * 20 + 10;
    let left = Math.random() * (window.screen.width * 0.99);
    let top = -110;

    snowflake.className = 'snowflake';
    snowflake.style.left = `${left}px`;
    snowflake.style.opacity = weight;
    snowflake.style.filter = `blur(${(1 - weight) * 3 + 1}px)`;
    snowflake.style.animationDelay = `${delay}s`;
    snowflake.style.animationDuration = `${duration}s`;

    snowflake.addEventListener('mouseover', () => {
        const sign = Math.random() - 0.5;
        if (sign == 0) sign += 0.001;
        let dLeft = sign / Math.abs(sign) * size * 5;
        let dTop = 0 - size * 2;
        snowflake.animate({
            left: `${dLeft}px`,
            top: `${dTop}px`
            //transform: `translate(${sign / Math.abs(sign) * size * 5}px, ${ -size * 2}px)`
        }, {
            easing: 'ease-out',
            duration: 500,
            composite: 'add'
        });
        setTimeout(() => {
            snowflake.style.left = `${left += dLeft}px`;
            snowflake.style.top = `${top += dTop}px`;
        }, 498);
    });

    realSnow.className = 'realSnow';
    realSnow.style.width = `${size}px`; realSnow.style.height = `${size}px`;

    snowflake.appendChild(realSnow);
    document.body.appendChild(snowflake);

    setTimeout(() => {
        document.body.removeChild(snowflake);
        makeSnowflake();
    }, (delay + duration) * 1000);
}

for (let i = 0; i < 100; i++) {
    setTimeout(makeSnowflake, i * 350);
}

backBtn.addEventListener('click', () => {
    window.history.back();
});

const naverSearchURL = "https://search.naver.com/search.naver?query=";
let area = '경주';
let response;

fetch(naverSearchURL + `${encodeURI(area + ' 날씨')}`, {
    method: 'GET'
}).then(res => {
    console.log(res.status);
    response = res;
}).catch(err => {
    console.error(err);
});