const timeText = document.getElementById('text-time');
const engListen = document.getElementById('eng-listen');
const engName = document.getElementById('upload-name');
const isPreEnd = document.getElementById('is-preend');
const isEngIntro = document.getElementById('is-eng-intro');

const timeTable = [
    '0805', '0810', '0825', '0835', '0840', '0950', '1000',
    '1015', '1020', '1025', '1030', '1200', '1210',
    '1255', '1300', '1305', '1307', '1410', '1420',
    '1435', '1440', '1445', '1450', '1515', '1520',
    '1530', '1535', '1600', '1605',
    '1607', '1632', '1637'
];
const listenFiles = [];

let playing = false;

window.onload = function () {
    window.setInterval(() => {
        const date = new Date();
        const fH = date.getHours().toString().padStart(2, '0');
        const fM = date.getMinutes().toString().padStart(2, '0');
        const formatTime = `${fH}:${fM}:${date.getSeconds().toString().padStart(2, '0')}`;
        timeText.textContent = formatTime;
        if (timeTable.includes(fH + fM)) {
            let ad = new Audio(`../assets/${fH + fM}.mp3`);
            if (fH + fM === '1307') {
                if (isEngIntro.checked) {
                    ad = listenFiles[0] ?? new Audio(`../assets/${fH + fM}.mp3`);
                } else {
                    ad.addEventListener('ended', () => {
                        listenFiles[0]?.play();
                    });
                }
            }
            if (!playing && !(isPreEnd.checked && ['0950', '1200', '1410', '1515', '1600', '1632'].includes(fH + fM))) {
                ad.play();
                playing = true;
            }
        } else {
            playing = false;
        }
    }, 999);
};

engListen.addEventListener('change', (e) => {
    e.preventDefault();
    console.log(e.target.files);
    
    for (let i = 0; i < e.target.files.length; i++) {
        const listURL = URL.createObjectURL(e.target.files.item(i));
        listenFiles.push(new Audio(listURL));
    }
    listenFiles.forEach((v, i) => {
        if (i !== listenFiles.length - 1) {
            v.addEventListener('ended', () => {
                listenFiles[i + 1].play();
            });
        }
    });

    const fileName = `${e.target.files.item(0).name}${e.target.files.length === 1? '' : ` 외 ${e.target.files.length - 1}개`}`;
    engName.value = fileName;
});