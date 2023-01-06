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
const gCtx = gameCanvas.getContext('2d');

const offscreenCanvas = document.createElement('canvas');
const offCtx = offscreenCanvas.getContext('2d');

const xCanvas = document.createElement('canvas');
const xCtx = xCanvas.getContext('2d');

/**
 * 패턴 표현 방법
 * 0: any
 * 1: 빈칸(금수X)
 * 2: 막힌 칸(백, 벽, 금수)
 * 3: 흑
 *
 * -n: n이 아님
 */

const dir = [[1, 0], [1, -1], [0, -1], [-1, -1]];

const foPs4 = [
    [0,2,1,-3],
    [-3,1,1,3],
    [-3,1,1,-3]
];

const thPs3 = [
    [0,2,1,1,1,-3],
    [-3,1,1,1,1,3],
    [-3,1,1,1,1,-3]
];

let tableSize = 15;
let tdSize, tableArray, lastBox = [], turn = 0, ended = false, drawForbid = false;

function getBoxByIndex(x, y) {
    if (tableSize * y + x < 0 || tableSize * y + x >= tableSize ** 2 || isNaN(tableSize * y + x)) return null;
    if (x < 0 || x >= tableSize || y < 0 || y >= tableSize || isNaN(tableSize * y + x)) return null;
    return tableArray.item(tableSize * y + x);
}

function getIndexByBox(target) {
    if (!target) return null;
    let firstTdPos = tableArray.item(0).getBoundingClientRect();
    return {
        x: Math.round((window.pageXOffset + target.getBoundingClientRect().x - firstTdPos.x) / tdSize), 
        y: Math.round((window.pageYOffset + target.getBoundingClientRect().y - firstTdPos.y) / tdSize) 
    };
}

function setTurn(t) {
    turn = t;
    turnText.textContent = `${turn % 2 == 0? 'BLACK' : 'WHITE'}의 차례입니다. (총 수: ${turn})`;
    if (turn % 2 == 0) {
        for (let i = 0; i < tableSize; i++) {
            for (let j = 0; j < tableSize; j++) {
                const testC = checkForbiddenNew(i, j, false);
                const st = getBoxByIndex(i, j);
                if (testC[0] >= 2) {
                    st.classList.add('forbid3');
                    gCtx.drawImage(xCanvas, tdSize * i, tdSize * j);
                    drawForbid = true;
                } else if (testC[1] >= 2) {
                    st.classList.add('forbid4');
                    gCtx.drawImage(xCanvas, tdSize * i, tdSize * j);
                    drawForbid = true;
                } else if (testC[2]) {
                    st.classList.add('forbidL');
                    gCtx.drawImage(xCanvas, tdSize * i, tdSize * j);
                    drawForbid = true;
                } else {
                    st.classList.remove('forbid3');
                    st.classList.remove('forbid4');
                    st.classList.remove('forbidL');
                }
            }
        }
    } else if (drawForbid) {
        gCtx.clearRect(0, 0, tdSize * tableSize, tdSize * tableSize);
        drawTableLine();
        drawForbid = false;
    }
}

function setEnded(res) {
    if (res) {
        ended = true;
        isWinText.textContent = `${res.toUpperCase()} 승리!`;
    } else {
        ended = false;
        isWinText.textContent = '아직 아무도 승리하지 않았어요.';
    }
}

function drawTableLine() {
    gCtx.drawImage(offscreenCanvas, 0, 0);
}

function initBoard() {
    table.innerHTML = '';
    for (let i = 0; i < tableSize; i++) {
        let tr = document.createElement('tr');
        for (let j = 0; j < tableSize; j++) {
            let td = document.createElement('td');
            td.classList.add('empty');
            td.style.borderColor = '#00000000';
            td.addEventListener('click', (event) => {
                if (ended) return;

                if (event.target.style.borderRadius == '50%') {
                    alert('이미 돌이 놓인 곳이에요.');
                    return;
                }
                if (turn % 2 == 0) {
                    if (event.target.classList.contains('forbid3')) {
                        alert('흑은 삼삼이 금지되어 있습니다.');
                        return;
                    } else if (event.target.classList.contains('forbid4')) {
                        alert('흑은 사사가 금지되어 있습니다.');
                        return;
                    } else if (event.target.classList.contains('forbidL')) {
                        alert('흑은 장목이 금지되어 있습니다.');
                        return;
                    }
                }
                event.target.style.borderRadius = '50%';
                event.target.style.borderColor = 'black';
                event.target.style.backgroundColor = turn % 2 == 0? 'black' : 'white';
                event.target.classList.replace('empty', turn % 2 == 0? 'black' : 'white');
                lastBox.push(event.target);
    
                setEnded(checkWin());
                setTurn(turn + 1);
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
    for (let i = 0; i < tableSize ** 2; i++) {
        tableArray.item(i).style.width = `${tdSize * 0.8}px`;
        tableArray.item(i).style.height = `${tdSize * 0.8}px`;
        tableArray.item(i).style.borderWidth = `${tdSize * 0.1}px`;
        tableArray.item(i).style.borderStyle = 'solid';
    }
    gameCanvas.width = tdSize * tableSize;
    gameCanvas.height = tdSize * tableSize;

    offscreenCanvas.width = tdSize * tableSize;
    offscreenCanvas.height = tdSize * tableSize;

    for (let i = 0; i < tableSize; i++) {
        offCtx.moveTo(tdSize / 2 + tdSize * i, tdSize / 2);
        offCtx.lineTo(tdSize / 2 + tdSize * i, tdSize * (tableSize - 0.5));
        offCtx.lineWidth = 1;
        offCtx.stroke();

        offCtx.moveTo(tdSize / 2, tdSize / 2 + tdSize * i);
        offCtx.lineTo(tdSize * (tableSize - 0.5), tdSize / 2 + tdSize * i);
        offCtx.lineWidth = 1;
        offCtx.stroke();
    }
    if (tableSize % 2 == 1) {
        offCtx.beginPath();
        offCtx.arc(tdSize / 2 + tdSize * (tableSize - 1) / 2, tdSize / 2 + tdSize * (tableSize - 1) / 2, tdSize / 5, 0, Math.PI * 2);
        offCtx.fill();
    }

    xCanvas.width = tdSize;
    xCanvas.height = tdSize;

    xCtx.moveTo(tdSize * (1/5), tdSize * (1/5));
    xCtx.lineTo(tdSize * (4/5), tdSize * (4/5));
    xCtx.strokeStyle = 'red';
    xCtx.lineWidth = 2;
    xCtx.stroke();

    xCtx.moveTo(tdSize * (1/5), tdSize * (4/5));
    xCtx.lineTo(tdSize * (4/5), tdSize * (1/5));
    xCtx.strokeStyle = 'red';
    xCtx.lineWidth = 2;
    xCtx.stroke();
    
    drawTableLine();
}

function resetBoard() {
    for (let i = 0; i < tableSize ** 2; i++) {
        tableArray.item(i).style.borderRadius = '0';
        tableArray.item(i).style.borderColor = '#00000000';
        tableArray.item(i).style.backgroundColor = '';
        tableArray.item(i).className = 'empty';
    }
    setEnded(false);
    setTurn(0);
    lastBox = [];
    drawForbid = false;

    gCtx.clearRect(0, 0, tdSize * tableSize, tdSize * tableSize);
    drawTableLine();
}

function matchPatternNew(tar, pat, checkForbid = false) {
    return pat.every((ansV, ind) => {
        if (ansV == 0) return true;
        if (ansV == 1) {
            if (!tar[ind]?.classList.contains('empty')) return false;
            if (checkForbid && checkForbiddenNewByNode(tar[ind], true)) return false;
            return true;
        }
        if (ansV == 2) {
            if (tar[ind] == null || tar[ind].classList.contains('white')) return true;
            if (checkForbid && checkForbiddenNewByNode(tar[ind], true)) return true;
            return false;
        }
        if (ansV == 3) return tar[ind]?.classList.contains('black');
        if (ansV == -3) return !tar[ind]?.classList.contains('black');
        return false;
    });
}

function checkForbiddenNewByNode(target, bool) {
    if (target == null || !target.classList.contains('empty')) return 0;
    let _pos = getIndexByBox(target);
    return checkForbiddenNew(_pos.x, _pos.y, bool);
}

function checkForbiddenNew(x, y, bool = false) {
    if (getBoxByIndex(x, y) == null || !getBoxByIndex(x, y).classList.contains('empty')) return bool? false : [0, 0, false];

    getBoxByIndex(x, y).classList.replace('empty', 'black');

    let count = 0;
    let tC = 0;
    let fC = 0;
    let isThree = false;
    let isFour = false;
    let isFive = false;
    let isL = false;

    let checkLists = [[], [], [], []];
    for (let i = 0; i < 4; i++) {
        let [dX, dY] = dir[i];
        isThree = false;
        isFour = false;
        for (let j = 0; j < 4; j++) {
            checkLists[i] = [
                getBoxByIndex(x - 4*dX + j * dX, y - 4*dY + j * dY),
                getBoxByIndex(x - 3*dX + j * dX, y - 3*dY + j * dY),
                getBoxByIndex(x - 2*dX + j * dX, y - 2*dY + j * dY),
                getBoxByIndex(x - 1*dX + j * dX, y - 1*dY + j * dY),
                getBoxByIndex(x + 0*dX + j * dX, y + 0*dY + j * dY),
                getBoxByIndex(x + 1*dX + j * dX, y + 1*dY + j * dY),
            ];
            count = checkLists[i].filter((v) => v?.classList.contains('black')).length;
            if (count == 6) {
                isL = true;
                break;
            } else {
                if (count == 5) {
                    if ((!checkLists[i][0]?.classList.contains('black') 
                    && !getBoxByIndex(x + 2*dX + j * dX, y + 2*dY + j * dY)?.classList.contains('black')) ||
                    (!checkLists[i][5]?.classList.contains('black') 
                    && !getBoxByIndex(x - 5*dX + j * dX, y - 5*dY + j * dY)?.classList.contains('black'))) {
                        isFive = true;
                        break;
                    }
                } else if (count == 4) {
                    if (!checkLists[i][5]?.classList.contains('black')) {
                        checkLists[i].splice(5, 1);
                        if (!checkLists[i][4]?.classList.contains('black')) {
                            if (getBoxByIndex(x - 5*dX + j * dX, y - 5*dY + j * dY)?.classList.contains('black')) continue;
                            checkLists[i].splice(4, 1);
                        }
                    }
                    if (!checkLists[i][0]?.classList.contains('black')) {
                        if (!checkLists[i][1]?.classList.contains('black')) {
                            if (getBoxByIndex(x + 2*dX + j * dX, y + 2*dY + j * dY)?.classList.contains('black')) continue;
                            checkLists[i].splice(0, 2);
                        } else checkLists[i].splice(0, 1);
                    }
                    if (checkLists.length <= 5) {
                        isFour = true;
                        break;
                    }
                } else if (count == 3 && (j == 1 || j == 2)) {
                    if (!checkLists[i][4]?.classList.contains('black') && !checkLists[i][5]?.classList.contains('black')) {
                        checkLists[i].splice(4, 2);
                        if (checkLists[i][3]?.classList.contains('black')) {
                            if (!checkLists[i][0]?.classList.contains('black')) checkLists[i].splice(0, 1);
                            else if (getBoxByIndex(x - 5*dX + j * dX, y - 5*dY + j * dY)?.classList.contains('black')) continue;
                            isThree = true;
                            break;
                        }
                    }
                    if (!checkLists[i][0]?.classList.contains('black') && !checkLists[i][1]?.classList.contains('black')) {
                        if (!checkLists[i][5]?.classList.contains('black')) checkLists[i].splice(5, 1);
                        else if (getBoxByIndex(x + 2*dX + j * dX, y + 2*dY + j * dY)?.classList.contains('black')) continue;
                        if (checkLists[i][2]?.classList.contains('black')) {
                            checkLists[i].splice(0, 2);
                            isThree = true;
                            break;
                        }
                    }
                }
            }
        }
        
        if (isFive) break;
        if (isL) continue;
        if (!isThree && !isFour) continue;

        let fpos = getIndexByBox(checkLists[i][0]);

        if (isFour) {
            if (checkLists[i].length == 4) {
                let tar445 = [
                    getBoxByIndex(fpos.x - 2*dX, fpos.y - 2*dY),
                    getBoxByIndex(fpos.x - 1*dX, fpos.y - 1*dY),
                    getBoxByIndex(fpos.x + 4*dX, fpos.y + 4*dY),
                    getBoxByIndex(fpos.x + 5*dX, fpos.y + 5*dY)
                ];
                if (foPs4.some((ansA) => matchPatternNew(tar445, ansA, false))) {
                    fC++;
                    continue;
                }
                tar445.reverse();
                if (foPs4.some((ansA) => matchPatternNew(tar445, ansA, false))) {
                    fC++;
                    continue;
                }
            } else if (checkLists[i].length == 5) {
                let tar445 = [
                    getBoxByIndex(fpos.x - 1*dX, fpos.y - 1*dY),
                    getBoxByIndex(fpos.x + 5*dX, fpos.y + 5*dY)
                ];
                if (matchPatternNew(tar445, [-3, -3])) {
                    fC++;
                    continue;
                }
            } else continue;
        } else if (isThree) {
            if (checkLists[i].length == 3) {
                let tar333 = [
                    getBoxByIndex(fpos.x - 3*dX, fpos.y - 3*dY),
                    getBoxByIndex(fpos.x - 2*dX, fpos.y - 2*dY),
                    getBoxByIndex(fpos.x - 1*dX, fpos.y - 1*dY),
                    getBoxByIndex(fpos.x + 3*dX, fpos.y + 3*dY),
                    getBoxByIndex(fpos.x + 4*dX, fpos.y + 4*dY),
                    getBoxByIndex(fpos.x + 5*dX, fpos.y + 5*dY)
                ];
                if (thPs3.some((ansA) => matchPatternNew(tar333, ansA, true))) {
                    tC++;
                    continue;
                }
                tar333.reverse();
                if (thPs3.some((ansA) => matchPatternNew(tar333, ansA, true))) {
                    tC++;
                    continue;
                }
            } else if (checkLists[i].length == 4) {
                let tar334 = [
                    getBoxByIndex(fpos.x - 2*dX, fpos.y - 2*dY), 
                    getBoxByIndex(fpos.x - 1*dX, fpos.y - 1*dY), 
                    getBoxByIndex(fpos.x + 0*dX, fpos.y + 0*dY),
                    getBoxByIndex(fpos.x + 1*dX, fpos.y + 1*dY),
                    getBoxByIndex(fpos.x + 2*dX, fpos.y + 2*dY),
                    getBoxByIndex(fpos.x + 3*dX, fpos.y + 3*dY),
                    getBoxByIndex(fpos.x + 4*dX, fpos.y + 4*dY), 
                    getBoxByIndex(fpos.x + 5*dX, fpos.y + 5*dY)
                ];
                if (matchPatternNew(tar334, [-3, 1, 3, 3, 1, 3, 1, -3], true)) {
                    tC++;
                    continue;
                }
                if (matchPatternNew(tar334, [-3, 1, 3, 1, 3, 3, 1, -3], true)) {
                    tC++;
                    continue;
                }
            } else continue;
        }
    }
        
    getBoxByIndex(x, y).classList.replace('black', 'empty');
    if (isFive) return bool? false : [0, 0, false];
    return bool? (tC >= 2 || fC >= 2) : [tC, fC, isL];
}

function checkWin() {
    for (let i = 0; i < tableSize; i++) {
        for (let j = 0; j < tableSize; j++) {
            if (getBoxByIndex(i, j).style.backgroundColor == '') continue;
            let checkList1 = [];
            let checkList2 = [];
            let checkList3 = [];
            let checkList4 = [];
            for (let k = 0; k < 5; k++) {
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

window.addEventListener('load', () => {
    initBoard();
    initSize();
});

window.addEventListener('resize', () => {
    initSize();
    if (turn == 0) return;
    for (let i = 0; i < tableSize; i++) {
        for (let j = 0; j < tableSize; j++) {
            if (getBoxByIndex(i, j).classList.contains('forbid3') || getBoxByIndex(i, j).classList.contains('forbid4') || getBoxByIndex(i, j).classList.contains('forbidL')) gCtx.drawImage(xCanvas, tdSize * i, tdSize * j);
        }
    }
});

undoBtn.addEventListener('click', () => {
    if (lastBox.length == 0) return;
    lastBox[lastBox.length - 1].style.borderRadius = '0';
    const color = lastBox[lastBox.length - 1].style.backgroundColor;
    lastBox[lastBox.length - 1].style.backgroundColor = '';
    lastBox[lastBox.length - 1].classList.replace(color, 'empty');
    lastBox[lastBox.length - 1].style.borderColor = '#00000000'
    lastBox.pop();
    setTurn(turn - 1);
    setEnded(checkWin());
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
    initSize();
});

backBtn.addEventListener('click', () => {
    window.location.href = '../';
});