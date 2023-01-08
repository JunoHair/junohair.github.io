const gameTableBox = document.getElementsByClassName('gameTable').item(0);
const table = document.createElement('table');
const undoBtn = document.getElementById('undo');
const resetBtn = document.getElementById('reset');
const backBtn = document.getElementById('back');
const reCountBtn = document.getElementById('reCount');
const turnText = document.getElementById('turns');
const isWinText = document.getElementById('isWin');
const cautionText = document.getElementById('caution');

/**
 * @type {HTMLCanvasElement}
 */
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
 * 10: 빈칸(금수 포함)
 * 2: 막힌 칸(백, 벽, 금수)
 * 3: 흑
 *
 * -n: n이 아님
 */

const dir = [[1, 0], [1, -1], [0, -1], [-1, -1]];

const foPs4 = [
    [0,2,10,-3],
    [3,10,10,-3],
    [-3,10,10,-3]
];

const thPs3 = [
    [0,2,10,10,10,-3],
    [3,10,10,10,10,-3],
    [-3,10,10,10,10,-3]
];

let tableSize = 15;

/**
 * @type {HTMLCollectionOf<HTMLTableCellElement>}
 */
let tableArray;

/**
 * @type {HTMLTableCellElement[]}
 */
let lastBox = [];
let tdSize, turn = 0, ended = false, drawForbid = false;

/**
 * 좌표로 오목판 칸의 td를 불러옴
 * @param {number} x 오목판 x좌표
 * @param {number} y 오목판 y좌표
 * @returns 좌표에 해당하는 오목판 칸의 td 요소
 */
function getBoxByIndex(x, y) {
    if (tableSize * y + x < 0 || tableSize * y + x >= tableSize ** 2 || isNaN(tableSize * y + x)) return null;
    if (x < 0 || x >= tableSize || y < 0 || y >= tableSize || isNaN(tableSize * y + x)) return null;
    return tableArray.item(tableSize * y + x);
}

/**
 * td로 좌표를 불러옴
 * @param {HTMLTableCellElement} target 오목판 칸의 td 요소
 * @returns td 요소에 해당하는 좌표
 */
function getIndexByBox(target) {
    if (!target) return null;
    let firstTdPos = tableArray.item(0).getBoundingClientRect();
    return {
        x: Math.round((target.getBoundingClientRect().x - firstTdPos.x) / tdSize), 
        y: Math.round((target.getBoundingClientRect().y - firstTdPos.y) / tdSize) 
    };
}

/**
 * 턴을 설정함
 * @param {number} t 설정할 턴
 */
function setTurn(t) {
    turn = t;
    turnText.textContent = `${turn % 2 == 0? '흑' : '백'}의 차례입니다. (총 수: ${turn})`;
    if (turn % 2 == 0) {
        for (let i = 0; i < tableSize; i++) {
            for (let j = 0; j < tableSize; j++) {
                const st = getBoxByIndex(i, j);
                const testC = checkForbiddenNew(i, j, false);
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
    } else {
        if (drawForbid) {
            gCtx.clearRect(0, 0, tdSize * tableSize, tdSize * tableSize);
            drawTableLine();
            drawForbid = false;
        }
    }
}

function setEnded(res) {
    if (res) {
        ended = true;
        isWinText.textContent = `${res == 'black'? '흑' : '백'} 승리!`;
        turnText.textContent = `(총 수: ${turn})`
        gCtx.clearRect(0, 0, tdSize * tableSize, tdSize * tableSize);
        drawTableLine();
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
                if (turn == 0 && tableSize % 2 == 1 && 
                    (getIndexByBox(event.target).x != (tableSize - 1) / 2 || getIndexByBox(event.target).y != (tableSize - 1) / 2)) {
                    alert('첫 수는 판의 중앙에 놓여야 합니다.');
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

                addStoneByNode(event.target);
                lastBox.push(event.target);
    
                setTurn(turn + 1);
                setEnded(checkWin());
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
    for (let i = 0; i < tableSize ** 2; i++) {
        tableArray.item(i).style.width = '36px';
        tableArray.item(i).style.height = '36px';
    }
    tdSize = Math.max(Math.round(Math.min(tableArray.item(0).getBoundingClientRect().width, tableArray.item(0).getBoundingClientRect().width) * 0.9), 5);
    if (tdSize % 2 == 1) tdSize--;
    for (let i = 0; i < tableSize ** 2; i++) {
        tableArray.item(i).style.width = `${tdSize - 4}px`;
        tableArray.item(i).style.height = `${tdSize - 4}px`;
        tableArray.item(i).style.borderWidth = `2px`;
        tableArray.item(i).style.borderStyle = 'solid';
    }
    gameCanvas.width = tdSize * tableSize;
    gameCanvas.height = tdSize * tableSize;

    offscreenCanvas.width = tdSize * tableSize;
    offscreenCanvas.height = tdSize * tableSize;

    for (let i = 0; i < tableSize; i++) {
        offCtx.moveTo(tdSize / 2 + tdSize * i, tdSize / 2);
        offCtx.lineTo(tdSize / 2 + tdSize * i, tdSize * (tableSize - 0.5));
        offCtx.lineWidth = 2;
        offCtx.stroke();

        offCtx.moveTo(tdSize / 2, tdSize / 2 + tdSize * i);
        offCtx.lineTo(tdSize * (tableSize - 0.5), tdSize / 2 + tdSize * i);
        offCtx.lineWidth = 2;
        offCtx.stroke();
    }
    if (tableSize % 2 == 1) {
        offCtx.beginPath();
        offCtx.arc(tdSize / 2 + tdSize * (tableSize - 1) / 2, tdSize / 2 + tdSize * (tableSize - 1) / 2, 
            tdSize / 8, 0, Math.PI * 2);
        offCtx.fill();

        if (tableSize > 9) {
            offCtx.beginPath();
            offCtx.arc(tdSize / 2 + tdSize * ((tableSize - 1) / 2 - 4), tdSize / 2 + tdSize * ((tableSize - 1) / 2 - 4), 
                tdSize / 8, 0, Math.PI * 2);
            offCtx.fill();

            offCtx.beginPath();
            offCtx.arc(tdSize / 2 + tdSize * ((tableSize - 1) / 2 + 4), tdSize / 2 + tdSize * ((tableSize - 1) / 2 - 4), 
                tdSize / 8, 0, Math.PI * 2);
            offCtx.fill();

            offCtx.beginPath();
            offCtx.arc(tdSize / 2 + tdSize * ((tableSize - 1) / 2 - 4), tdSize / 2 + tdSize * ((tableSize - 1) / 2 + 4), 
                tdSize / 8, 0, Math.PI * 2);
            offCtx.fill();

            offCtx.beginPath();
            offCtx.arc(tdSize / 2 + tdSize * ((tableSize - 1) / 2 + 4), tdSize / 2 + tdSize * ((tableSize - 1) / 2 + 4), 
                tdSize / 8, 0, Math.PI * 2);
            offCtx.fill();
        }
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
        removeStoneByNode(tableArray.item(i));
    }
    setTurn(0);
    setEnded(false);
    lastBox = [];
    drawForbid = false;

    gCtx.clearRect(0, 0, tdSize * tableSize, tdSize * tableSize);
    drawTableLine();
}

function addStoneByNode(node) {
    if (node == null) return false;
    node.style.borderRadius = '50%';
    node.style.borderColor = 'black';
    node.style.backgroundColor = turn % 2 == 0? 'black' : 'white';
    node.style.boxShadow = '0 0 4px black';
    node.classList.replace('empty', turn % 2 == 0? 'black' : 'white');
    return true;
}

function addStoneByNum(x, y) {
    const stone = getBoxByIndex(x, y);
    return addStoneByNode(stone);
}

function removeStoneByNode(node) {
    if (node == null) return false;
    node.style.borderRadius = '0';
    node.style.borderColor = '#00000000';
    node.style.backgroundColor = '';
    node.style.boxShadow = '';
    node.className = 'empty';
    return true;
}

function removeStoneByNum(x, y) {
    const stone = getBoxByIndex(x, y);
    return removeStoneByNode(stone, turn);
}

/**
 * 칸들이 패턴에 맞는 지 검사함
 * @param {(HTMLTableCellElement | null)[]} tar 
 * @param {number[]} pat 
 * @returns 
 */
function matchPatternNew(tar, pat) {
    return pat.every((ansV, ind) => {
        if (ansV == 0) return true;
        if (ansV == 1) {
            if (!tar[ind]?.classList.contains('empty')) return false;
            if (checkForbiddenNewByNode(tar[ind], true)) return false;
            return true;
        }
        if (ansV == 10) return tar[ind]?.classList.contains('empty');
        if (ansV == 2) return tar[ind] == null || tar[ind].classList.contains('white');
        if (ansV == 3) return tar[ind]?.classList.contains('black');
        if (ansV == -3) return !tar[ind]?.classList.contains('black');
        return false;
    });
}

function checkForbiddenNewByNode(target, bool) {
    if (target == null || !target.classList.contains('empty')) return bool? false : [0, 0, false];
    let _pos = getIndexByBox(target);
    return checkForbiddenNew(_pos.x, _pos.y, bool);
}

/**
 * 좌표에 해당하는 칸이 금수 자리인지 확인
 * @param {number} x x좌표
 * @param {number} y y좌표
 * @param {boolean} bool 반환값 논리형 여부
 * @returns 논리형 반환값일 때 금수 여부, 배열 반환값일 때 [삼의 개수, 사의 개수, 장목의 여부]
 */
function checkForbiddenNew(x, y, bool = false) {
    if (getBoxByIndex(x, y) == null || !getBoxByIndex(x, y).classList.contains('empty')) return bool? false : [0, 0, false];

    getBoxByIndex(x, y).classList.replace('empty', 'black');

    let count = 0;
    let tC = 0;
    let fC = 0;
    let isFive = false;
    let isL = false;

    let checkLists = [[], [], [], []];
    for (let i = 0; i < 4; i++) {
        let [dX, dY] = dir[i];
        let fpos;
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
            } else if (count == 5) {
                if ((!checkLists[i][0]?.classList.contains('black') && 
                    !getBoxByIndex(x + 2*dX + j * dX, y + 2*dY + j * dY)?.classList.contains('black')) ||
                (!checkLists[i][5]?.classList.contains('black') && 
                    !getBoxByIndex(x - 5*dX + j * dX, y - 5*dY + j * dY)?.classList.contains('black'))) {
                    isFive = true;
                    break;
                }
            } else if (tC >= 2 || fC >= 2) {
                continue;
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
                if (checkLists[i].length <= 5) {
                    if (checkLists[i].length == 5 && !checkLists[i].some((v) => v?.classList.contains('empty'))) continue;
                    fpos = getIndexByBox(checkLists[i][0]);
                    if (checkLists[i].length == 5) {
                        if (!checkLists[i].some((v) => v?.classList.contains('empty'))) continue;
                        let tar445 = [
                            getBoxByIndex(fpos.x - 1*dX, fpos.y - 1*dY),
                            getBoxByIndex(fpos.x + 5*dX, fpos.y + 5*dY)
                        ];
                        if (matchPatternNew(tar445, [-3, -3])) {
                            fC++;
                            break;
                        }
                    } else if (checkLists[i].length == 4) {
                        let tar445 = [
                            getBoxByIndex(fpos.x - 2*dX, fpos.y - 2*dY),
                            getBoxByIndex(fpos.x - 1*dX, fpos.y - 1*dY),
                            getBoxByIndex(fpos.x + 4*dX, fpos.y + 4*dY),
                            getBoxByIndex(fpos.x + 5*dX, fpos.y + 5*dY)
                        ];
                        let is45 = foPs4.some((ansA) => matchPatternNew(tar445, ansA));
                        tar445.reverse();
                        let is45R = foPs4.some((ansA) => matchPatternNew(tar445, ansA));
                        if (is45 || is45R) {
                            fC++;
                            break;
                        }
                    }
                }
            } else if (count == 3 && (j == 1 || j == 2)) {
                if (!checkLists[i][4]?.classList.contains('black') && !checkLists[i][5]?.classList.contains('black')) {
                    checkLists[i].splice(4, 2);
                    if (checkLists[i][3]?.classList.contains('black')) {
                        if (!checkLists[i][0]?.classList.contains('black')) checkLists[i].splice(0, 1);
                        else if (getBoxByIndex(x - 5*dX + j * dX, y - 5*dY + j * dY)?.classList.contains('black')) continue;
                    } else continue;
                } else if (!checkLists[i][0]?.classList.contains('black') && !checkLists[i][1]?.classList.contains('black')) {
                    if (!checkLists[i][5]?.classList.contains('black')) checkLists[i].splice(5, 1);
                    else if (getBoxByIndex(x + 2*dX + j * dX, y + 2*dY + j * dY)?.classList.contains('black')) continue;
                    if (checkLists[i][2]?.classList.contains('black')) {
                        checkLists[i].splice(0, 2);
                    } else continue;
                } else if (!checkLists[i][0]?.classList.contains('black') && !checkLists[i][5]?.classList.contains('black')) {
                    checkLists[i].splice(5, 1);
                    if (!checkLists[i][4]?.classList.contains('black')) checkLists[i].splice(4, 1);
                    if (!checkLists[i][1]?.classList.contains('black')) checkLists[i].splice(1, 1);
                    checkLists[i].splice(0, 1);
                    if (checkLists[i].length == 4 && !checkLists[i].some((v) => v?.classList.contains('empty'))) continue;
                } else continue;
                fpos = getIndexByBox(checkLists[i][0]);
                if (checkLists[i].length == 3) {
                    let tar333 = [
                        getBoxByIndex(fpos.x - 3*dX, fpos.y - 3*dY),
                        getBoxByIndex(fpos.x - 2*dX, fpos.y - 2*dY),
                        getBoxByIndex(fpos.x - 1*dX, fpos.y - 1*dY),
                        getBoxByIndex(fpos.x + 3*dX, fpos.y + 3*dY),
                        getBoxByIndex(fpos.x + 4*dX, fpos.y + 4*dY),
                        getBoxByIndex(fpos.x + 5*dX, fpos.y + 5*dY)
                    ];
                    let is33 = thPs3.some((ansA) => matchPatternNew(tar333, ansA)), is33R;
                    if (!is33) {
                        tar333.reverse();
                        is33R = thPs3.some((ansA) => matchPatternNew(tar333, ansA));
                    }
                    if (is33 || is33R) {
                        let leftForbid = checkForbiddenNewByNode(tar333[2], true);
                        if (leftForbid && (tar333[4] == null || tar333[4].classList.contains('white'))) continue;
                        let rightForbid = checkForbiddenNewByNode(tar333[3], true);
                        if (rightForbid && (tar333[1] == null || tar333[1].classList.contains('white'))) continue;
                        if (!(leftForbid && rightForbid)) {
                            tC++;
                            break;
                        }
                    }
                } else if (checkLists[i].length == 4) {
                    let tar334 = [
                        getBoxByIndex(fpos.x - 2*dX, fpos.y - 2*dY), 
                        getBoxByIndex(fpos.x - 1*dX, fpos.y - 1*dY), 
                        getBoxByIndex(fpos.x + 4*dX, fpos.y + 4*dY), 
                        getBoxByIndex(fpos.x + 5*dX, fpos.y + 5*dY)
                    ];
                    if (matchPatternNew(tar334, [-3, 10, 10, -3])) {
                        let emptyIn34 = checkLists[i].find(v => v?.classList.contains('empty'));
                        if (emptyIn34 == null || checkForbiddenNewByNode(emptyIn34, true)) continue;
                        tC++;
                        break;
                    }
                }
            }
        }
        
        if (isFive) break;
        if (isL) continue;
    }
        
    getBoxByIndex(x, y).classList.replace('black', 'empty');
    if (isFive) return bool? false : [0, 0, false];
    return bool? (tC >= 2 || fC >= 2 || isL) : [tC, fC, isL];
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
    if (turn == 0 || turn % 2 == 1) return;
    for (let i = 0; i < tableSize; i++) {
        for (let j = 0; j < tableSize; j++) {
            if (getBoxByIndex(i, j).classList.contains('forbid3') || 
                getBoxByIndex(i, j).classList.contains('forbid4') || getBoxByIndex(i, j).classList.contains('forbidL')) 
                gCtx.drawImage(xCanvas, tdSize * i, tdSize * j);
        }
    }
});

undoBtn.addEventListener('click', () => {
    if (lastBox.length == 0) return;
    removeStoneByNode(lastBox[lastBox.length - 1]);
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
        cautionText.innerHTML = '그리고 이러면 게임이 안 끝나잖아 멍청아!!!!!<br>';
    } else {
        cautionText.innerHTML = '';
    }
    
    resetBoard();
    tableSize = count;
    initBoard();
    initSize();
});

backBtn.addEventListener('click', () => {
    window.location.href = '../';
});