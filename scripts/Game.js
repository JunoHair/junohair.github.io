const gameTableBox = document.getElementsByClassName('gameTable').item(0);
const table = document.createElement('table');
const undoBtn = document.getElementById('undo');
const resetBtn = document.getElementById('reset');
const backBtn = document.getElementById('back');
const reCountBtn = document.getElementById('reCount');
const turnText = document.getElementById('turns');
const isWinText = document.getElementById('isWin');
const cautionText = document.getElementById('caution');

const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');

const threePats = [
    //2-0
    [ 0,  1, 1, 0, 2, 0, -1, -1, -1],
    [ 0,  1, 0, 1, 2, 0, -1, -1, -1],
    [-2,  0, 1, 1, 2, 0, -2, -1, -1],
    //1-1
    [-1,  0, 1, 0, 2, 1,  0, -1, -1],
    [-1, -2, 0, 1, 2, 1,  0, -2, -1]
];

const fourPats = [
    //3-0
    [ 1,  1, 1, 0, 2, -1, -1, -1, -1],
    [ 1,  1, 0, 1, 2, -1, -1, -1, -1],
    [ 1,  0, 1, 1, 2, -1, -1, -1, -1],
    [-2,  1, 1, 1, 2, -2, -1, -1, -1],
    //2-1
    [-1,  1, 1, 0, 2,  1, -1, -1, -1],
    [-1,  1, 0, 1, 2,  1, -1, -1, -1],
    [-1, -2, 1, 1, 2,  1, -2, -1, -1]
];

const longPats = [
    [-1, 1, 1, 1, 2, 1,  1, -1, -1],
    [ 1, 1, 1, 1, 2, 1, -1, -1, -1]
]

let tableSize = 15;
let tdSize, tableArray, firstTdPos, pos, lastBox = [], turn = 0, ended = false;

function getBoxByIndex(x, y) {
    return tableArray.item(tableSize * y + x);
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
                if (turn % 2 == 0) {
                    firstTdPos = getPositionByNode(tableArray.item(0));
                    let judgement = checkForbidden(Math.round((getPositionByNode(event.target).x - firstTdPos.x)/tdSize), 
                                                   Math.round((getPositionByNode(event.target).y - firstTdPos.y)/tdSize));
                    if (judgement[0] >= 2) {
                        alert('흑은 삼삼이 금지되어 있습니다.');
                        return;
                    }
                    if (judgement[1] >= 2) {
                        alert('흑은 사사가 금지되어 있습니다.');
                        return;
                    }
                    if (judgement[2]) {
                        alert('흑은 장목이 금지되어 있습니다.');
                        return;
                    }
                }
                event.target.style.borderRadius = '50%';
                event.target.style.backgroundColor = turn % 2 == 0? 'black' : 'white';
                lastBox.push(event.target);
    
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
    firstTdPos = getPositionByNode(tableArray.item(0));
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
    lastBox = [];
    isWinText.textContent = '아직 아무도 승리하지 않았어요.';
    turnText.textContent = `${turn % 2 == 0? 'BLACK' : 'WHITE'}의 차례입니다. (총 수: ${turn})`;
}

function checkForbidden(x, y) {
    //좌 좌상 상 우상
    let checkLists = [[], [], [], []];

    for (j = 4; j > 0; j--) {
        if (y - j >= 0) {
            checkLists[1].push(x - j >= 0? getBoxByIndex(x - j, y - j) : null);
            checkLists[3].push(x + j < tableSize? getBoxByIndex(x + j, y - j) : null);
            checkLists[2].push(getBoxByIndex(x, y - j));
        } else {
            checkLists[1].push(null);
            checkLists[2].push(null);
            checkLists[3].push(null);
        }
        checkLists[0].push(x - j >= 0? getBoxByIndex(x - j, y) : null);
    }
    for (j = 0; j < 5; j++) {
        if (y + j < tableSize) {
            checkLists[1].push(x + j < tableSize? getBoxByIndex(x + j, y + j) : null);
            checkLists[3].push(x - j >= 0? getBoxByIndex(x - j, y + j) : null);
            checkLists[2].push(getBoxByIndex(x, y + j));
        } else {
            checkLists[1].push(null);
            checkLists[2].push(null);
            checkLists[3].push(null);
        }
        checkLists[0].push(x + j < tableSize? getBoxByIndex(x + j, y) : null);
    }

    let tC = 0, fC = 0, l = false;
    let reversePat = [];
    for (i = 0; i < 4; i++) {
        let res = [];
        res[0] = threePats.filter((ansA) => {
            let min2C = 0;
            return ansA.every((ansV, ind) => {
                if (ansV == -2) {
                    if (checkLists[i][ind] == null || checkLists[i][ind].style.backgroundColor == 'white') min2C++;
                    else if (checkLists[i][ind].style.backgroundColor == 'black') return false;
                    if (min2C == 2) return false;
                    return true;
                }
                if (checkLists[i][ind] == null) {
                    return ansV == -1;
                }
                if (checkLists[i][ind].style.backgroundColor == '' && (ind == 4 || ansV == 0)) return true;
                if (checkLists[i][ind].style.backgroundColor == 'black' && ansV == 1) return true;
                if (ansV == -1) return true;
                return false;
            })
        });
        res[1] = threePats.filter((ansA, ri) => {
            reversePat = ansA;
            reversePat.reverse();
            if (ri == threePats.length - 1) return false;
            let min2C = 0;
            return reversePat.every((ansV, ind) => {
                if (ansV == -2) {
                    if (checkLists[i][ind] == null || checkLists[i][ind].style.backgroundColor == 'white') min2C++;
                    else if (checkLists[i][ind].style.backgroundColor == 'black') return false;
                    if (min2C == 2) return false;
                    return true;
                }
                if (checkLists[i][ind] == null) {
                    return ansV == -1;
                }
                if (checkLists[i][ind].style.backgroundColor == '' && (ind == 4 || ansV == 0)) return true;
                if (checkLists[i][ind].style.backgroundColor == 'black' && ansV == 1) return true;
                if (ansV == -1) return true;
                return false;
            })
        });
        res[2] = fourPats.filter((ansA) => {
            let min2C = 0;
            return ansA.every((ansV, ind) => {
                if (ansV == -2) {
                    if (checkLists[i][ind] == null || checkLists[i][ind].style.backgroundColor == 'white') min2C++;
                    else if (checkLists[i][ind].style.backgroundColor == 'black') return false;
                    if (min2C == 2) return false;
                    return true;
                }
                if (checkLists[i][ind] == null) {
                    return ansV == -1;
                }
                if (checkLists[i][ind].style.backgroundColor == '' && (ind == 4 || ansV == 0)) return true;
                if (checkLists[i][ind].style.backgroundColor == 'black' && ansV == 1) return true;
                if (ansV == -1) return true;
                return false;
            })
        });
        res[3] = fourPats.filter((ansA) => {
            reversePat = ansA;
            reversePat.reverse();
            let min2C = 0;
            return reversePat.every((ansV, ind) => {
                if (ansV == -2) {
                    if (checkLists[i][ind] == null || checkLists[i][ind].style.backgroundColor == 'white') min2C++;
                    else if (checkLists[i][ind].style.backgroundColor == 'black') return false;
                    if (min2C == 2) return false;
                    return true;
                }
                if (checkLists[i][ind] == null) {
                    return ansV == -1;
                }
                if (checkLists[i][ind].style.backgroundColor == '' && (ind == 4 || ansV == 0)) return true;
                if (checkLists[i][ind].style.backgroundColor == 'black' && ansV == 1) return true;
                if (ansV == -1) return true;
                return false;
            })
        });
        res[4] = longPats.some((ansA) => {
            return ansA.every((ansV, ind) => {
                if (checkLists[i][ind] == null) {
                    return ansV == -1;
                }
                if (checkLists[i][ind].style.backgroundColor == '' && (ind == 4 || ansV == 0)) return true;
                if (checkLists[i][ind].style.backgroundColor == 'black' && ansV == 1) return true;
                if (ansV == -1) return true;
                return false;
            })
        });
        res[5] = longPats.some((ansA) => {
            reversePat = ansA;
            reversePat.reverse();
            return reversePat.every((ansV, ind) => {
                if (checkLists[i][ind] == null) {
                    return ansV == -1;
                }
                if (checkLists[i][ind].style.backgroundColor == '' && (ind == 4 || ansV == 0)) return true;
                if (checkLists[i][ind].style.backgroundColor == 'black' && ansV == 1) return true;
                if (ansV == -1) return true;
                return false;
            })
        });

        //console.log(i);
        //console.log(res);

        tC += res[0].length;
        tC += res[1].length;
        fC += res[2].length;
        fC += res[3].length;
        l = l || res[4] || res[5];
    }

    //console.log(checkLists);
    return [tC, fC, l];
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
    return stoneArray.length != 0 && 
    (stoneArray.every((v) => v.style.backgroundColor == 'white') || stoneArray.every((v) => v.style.backgroundColor == 'black'));
}

initBoard();
initSize();

window.addEventListener('resize', initSize);

undoBtn.addEventListener('click', () => {
    if (lastBox.length == 0) return;
    lastBox[lastBox.length - 1].style.borderRadius = '0';
    lastBox[lastBox.length - 1].style.backgroundColor = '';
    lastBox.pop();
    turn--;
    turnText.textContent = `${turn % 2 == 0? 'BLACK' : 'WHITE'}의 차례입니다. (총 수: ${turn})`;
});

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