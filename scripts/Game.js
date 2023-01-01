const gameTableBox = document.getElementsByClassName('gameTable').item(0);
const table = document.createElement('table');
const resetBtn = document.getElementById('reset');
const backBtn = document.getElementById('back');
const reCountBtn = document.getElementById('reCount');
const turnText = document.getElementById('turns');
const isWinText = document.getElementById('isWin');
const cautionText = document.getElementById('caution');

const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');

let tableSize = 19;
let tdSize, tableArray, firstTdPos, pos, turn = 0, ended = false;

function getBoxByIndex(x, y) {
    return tableArray.item(19 * y + x);
}

/**
 * x, y좌표 읽어오기
 * @param {Node} target 
 * @returns x, y
 */
function getPositionByNode(target) {
    return {x: window.pageXOffset + target.getBoundingClientRect().x, y: window.pageYOffset + target.getBoundingClientRect().y};
}

function drawTableLine() {
    for (i = 0; i < tableSize; i++) {
        ctx.moveTo(tdSize / 2 + tdSize * i, 0);
        ctx.lineTo(tdSize / 2 + tdSize * i, tdSize * tableSize);
        ctx.stroke();

        ctx.moveTo(0, tdSize / 2 + tdSize * i);
        ctx.lineTo(tdSize * tableSize, tdSize / 2 + tdSize * i);
        ctx.stroke();
    }
}

function initBoard() {
    table.innerHTML = '';
    for (i = 0; i < tableSize; i++) {
        let tr = document.createElement('tr');
        for (j = 0; j < tableSize; j++) {
            let td = document.createElement('td');
            td.addEventListener('click', (event) => {
                /* 
                삽질의 흔적 ㅅㅂ
                
                pos = getPositionByNode(event.target);
                firstTdPos = getPositionByNode(tableArray.item(0));
                console.log('x: %d, y: %d', pos.x, pos.y);
                ctx.beginPath();
                ctx.arc(pos.x - firstTdPos.x + tdSize / 2, pos.y - firstTdPos.y + tdSize / 2, tdSize * (2 / 5), 0, Math.PI * 2);
                ctx.fillStyle = turn % 2 == 0? 'black' : 'white';
                ctx.fill();
                */

                if (ended) return;

                if (event.target.style.borderRadius == '50%') {
                    alert('이미 돌이 놓인 곳이에요.');
                    return;
                }
                event.target.style.borderRadius = '50%';
                event.target.style.backgroundColor = turn % 2 == 0? 'black' : 'white';
    
                let con = checkWin();
                if (con) {
                    ended = true;
                    isWinText.textContent = `${con.toUpperCase()} 승리!`;
                } else isWinText.textContent = '아직 아무도 승리하지 않았어요.';
                turn++;
                turnText.textContent = `${turn % 2 == 0? 'BLACK' : 'WHITE'}의 차례입니다. (총 수: ${turn})`;
            });
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    gameTableBox.appendChild(table);
    tableArray = document.getElementsByTagName('td');
    initSize();
}

function initSize() {
    tdSize = Math.min(tableArray.item(0).offsetWidth, tableArray.item(0).offsetHeight);
    for (i = 0; i < tableSize ** 2; i++) {
        tableArray.item(i).style.width = `${tdSize}px`;
        tableArray.item(i).style.height = `${tdSize}px`;
    }
    gameCanvas.width = tdSize * tableSize;
    gameCanvas.height = tdSize * tableSize;
    drawTableLine();
}

function resetBoard() {
    /*
    삽질의 흔적 2

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.beginPath();
    drawTableLine();
    */

    for (i = 0; i < tableSize ** 2; i++) {
        tableArray.item(i).style.borderRadius = '0';
        tableArray.item(i).style.backgroundColor = '';
    }
    ended = 0;
    turn = 0;
    isWinText.textContent = '아직 아무도 승리하지 않았어요.';
    turnText.textContent = `${turn % 2 == 0? 'BLACK' : 'WHITE'}의 차례입니다. (총 수: ${turn})`;
}

function checkWin() {
    for (i = 0; i < tableSize; i++) {
        for (j = 0; j < tableSize; j++) {
            if (getBoxByIndex(i, j).style.backgroundColor == '') continue;
            let checkList1 = [];
            let checkList2 = [];
            let checkList3 = [];
            let checkList4 = [];
            for (k = 0; k < 5; k++) {
                if (i + 4 < tableSize) {
                    if (j + 4 < tableSize) checkList3.push(getBoxByIndex(i + k, j + k));
                    if (j - 4 >= 0) checkList4.push(getBoxByIndex(i + k, j - k));
                    checkList1.push(getBoxByIndex(i + k, j));
                }
                if (j + 4 < tableSize) checkList2.push(getBoxByIndex(i, j + k));
            }
            if (isAllStoneSame(checkList1)) return checkList1[0].style.backgroundColor;
            if (isAllStoneSame(checkList2)) return checkList2[0].style.backgroundColor;
            if (isAllStoneSame(checkList3)) return checkList3[0].style.backgroundColor;
            if (isAllStoneSame(checkList4)) return checkList4[0].style.backgroundColor;
        }
    }
    return false;
}

function isAllStoneSame(stoneArray) {
    return stoneArray.length == 5 && 
    (stoneArray.every((v) => v.style.backgroundColor == 'white') || stoneArray.every((v) => v.style.backgroundColor == 'black'));
}

initBoard();
initSize();

window.addEventListener('resize', initSize);

resetBtn.addEventListener('click', resetBoard);

reCountBtn.addEventListener('click', () => {
    let message = prompt(`현재 바둑판의 크기는 ${tableSize} * ${tableSize} 입니다.\nN * N 크기의 바둑판으로 초기화합니다.\n자연수 N을 입력해주세요.`);
    if (message == null || message == '') return;
    let count = Number(message);
    if (isNaN(count) || count <= 0 || Math.floor(count) != count) {
        alert('올바른 값을 입력해주세요.');
        return;
    }
    if (count >= 50) {
        if (!confirm('입력하신 크기로 설정했을 때 과도한 연산으로 기기에 무리가 갈 수 있습니다.\n계속하시겠습니까?')) return;
    }
    if (count < 5) {
        cautionText.textContent = '그리고 이러면 게임이 안 끝나잖아 멍청아!!!!!';
    } else {
        cautionText.textContent = '';
    }
    
    resetBoard();
    tableSize = count;
    initBoard();
});

backBtn.addEventListener('click', () => {
    window.location.href = '../';
});