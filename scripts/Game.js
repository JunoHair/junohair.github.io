const gameTableBox = document.getElementsByClassName('gameTable').item(0);
const table = document.createElement('table');
const resetBtn = document.getElementById('reset');
const backBtn = document.getElementById('back');

const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
let tr, td, firstTdPos, pos, turn = 0;

function getTableByIndex(x, y) {
    return table.childNodes.item(y).childNodes.item(x);
}

/**
 * x, y좌표 읽어오기
 * @param {Node} target 
 * @returns x, y
 */
function getPositionByNode(target) {
    return {x: target.getBoundingClientRect().x, y: target.getBoundingClientRect().y};
}

function drawTableLine() {
    for (i = 0; i < 19; i++) {
        ctx.moveTo(12.5 + 25 * i, 0);
        ctx.lineTo(12.5 + 25 * i, 475);
        ctx.stroke();

        ctx.moveTo(0, 12.5 + 25 * i);
        ctx.lineTo(475, 12.5 + 25 * i);
        ctx.stroke();
    }
}

/* 판 초기화 */
for (i = 0; i < 19; i++) {
    tr = document.createElement('tr');
    for (j = 0; j < 19; j++) {
        td = document.createElement('td');
        td.addEventListener('click', (event) => {
            pos = getPositionByNode(event.target);
            ctx.beginPath();
            ctx.arc(pos.x - firstTdPos.x + 12.5, pos.y - firstTdPos.y + 12.5, 10, 0, Math.PI * 2);
            /*ctx.fillStyle = 'black';
            ctx.lineWidth = 2;
            ctx.stroke();*/
            ctx.fillStyle = turn % 2 == 0? 'black' : 'white';
            ctx.fill();

            turn++;
        });
        tr.appendChild(td);
    }
    table.appendChild(tr);
}
gameTableBox.appendChild(table);
drawTableLine();
firstTdPos = getPositionByNode(document.getElementsByTagName('td').item(0));

resetBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, 475, 475);
    ctx.beginPath();
    drawTableLine();
});

backBtn.addEventListener('click', () => {
    window.history.back();
});