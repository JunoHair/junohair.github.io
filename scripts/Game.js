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

/**
 * 패턴 표현 방법
 * 0: any
 * 1: 빈칸(금수X)
 * 2: 막힌 칸(백, 벽, 금수)
 * 3: 흑
 * 9: 검사자리
 * 
 * 12: 뚫막, 막뚫, 뚫뚫
 * -n: n이 아님
 */

const threePats = [
    //2-0
    [1, 3, 3, 1, 9, 1, 0, 0, 0],
    [1, 3, 1, 3, 9, 1, 0, 0, 0],
    [12, 1, 3, 3, 9, 1, 12, 0, 0],

    //1-1
    [0,  1, 3, 1, 9, 3,  1,  0, 0],
    [0,  1, 1, 3, 9, 1,  3,  0, 0],
    [0, 12, 1, 3, 9, 3,  1, 12, 0],

    //0-2
    [0, 0, 0, 1, 9, 1, 3, 3, 1],
    [0, 0, 0, 1, 9, 3, 1, 3, 1],
    [0, 0, 12, 1, 9, 3, 3, 1, 12]
];

const fourPats = [
    //3-0
    [3, 3, 3, 1, 9, 0, 0, 0, 0],
    [3, 3, 1, 3, 9, 0, 0, 0, 0],
    [3, 1, 3, 3, 9, 0, 0, 0, 0],
    [12, 3, 3, 3, 9, 12, 0, 0, 0],
    
    //2-1
    [0, 3, 3, 1, 9, 3, 0, 0, 0],
    [0, 3, 1, 3, 9, 3, 0, 0, 0],
    [0, 12, 3, 3, 9, 3, 12, 0, 0]
];

const longPats = [
    [0, 3, 3, 3, 9, 3, 0, 0, 0],
    [3, 3, 3, 3, 9, 3, 0, 0, 0]
]

let tableSize = 15;
let tdSize, tableArray, lastBox = [], turn = 0, ended = false;

function getBoxByIndex(x, y) {
    if (tableSize * y + x < 0 || tableSize * y + x >= tableSize ** 2 || isNaN(tableSize * y + x)) return null;
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
                const testC = checkForbidden(i, j);
                const st = getBoxByIndex(i, j);
                if (testC[0] >= 2 || testC[1] >= 2 || testC[2]) {
                    console.log('%d %d 금수', i, j);
                    st.classList.add('forbidden');
                } else {
                    st.classList.remove('forbidden');
                }
            }
        }
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
    for (let i = 0; i < tableSize; i++) {
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
    for (let i = 0; i < tableSize; i++) {
        let tr = document.createElement('tr');
        for (let j = 0; j < tableSize; j++) {
            let td = document.createElement('td');
            td.classList.add('empty');
            td.addEventListener('click', (event) => {
                //console.log(getIndexByBox(event.target));

                if (ended) return;

                if (event.target.style.borderRadius == '50%') {
                    alert('이미 돌이 놓인 곳이에요.');
                    return;
                }
                if (turn % 2 == 0) {
                    if (event.target.classList.contains('forbidden')) {
                        event.target.classList.replace('empty', 'black');
                        setTurn(turn);
                        const pos = getIndexByBox(event.target);
                        const testC = checkForbidden(pos.x, pos.y, true);
                        if (testC[0] >= 2) {
                            alert('흑은 삼삼이 금지되어 있습니다.');
                            setTurn(turn);
                            return;
                        } else if (testC[1] >= 2) {
                            alert('흑은 사사가 금지되어 있습니다.');
                            setTurn(turn);
                            return;
                        } else if (testC[2]) {
                            alert('흑은 장목이 금지되어 있습니다.');
                            setTurn(turn);
                            return;
                        } else {
                            event.target.classList.remove('forbidden');
                        }
                    }
                }
                event.target.style.borderRadius = '50%';
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
        tableArray.item(i).style.width = `${tdSize}px`;
        tableArray.item(i).style.height = `${tdSize}px`;
    }
    gameCanvas.width = tdSize * tableSize;
    gameCanvas.height = tdSize * tableSize;
    drawTableLine();
}

function resetBoard() {
    for (let i = 0; i < tableSize ** 2; i++) {
        tableArray.item(i).style.borderRadius = '0';
        tableArray.item(i).style.backgroundColor = '';
        tableArray.item(i).className = 'empty';
    }
    setEnded(false);
    setTurn(0);
    lastBox = [];
}

function matchPattern(target, pats, reverse = false, checkForbid = false) {
    //console.log(target);
    let min2C, reversePat;
    const matchingCallBack = (ansV, ind) => {
        if (ansV == 0 || ansV == 9) return true;
        if (ansV == 1) {
            if (!target[ind]?.classList.contains('empty')) return false;
            if (checkForbid && target[ind]?.classList.contains('forbidden')) {
                target[ind].classList.replace('empty', 'black');
                checkEveryForbidden(false);
                const pos = getIndexByBox(target[ind]);
                const testC = checkForbidden(pos.x, pos.y, true);
                if (testC[0] >= 2 || testC[1] >= 2 || testC[2]) return false;
            }
            return true;
        }
        if (ansV == 2) {
            if (target[ind] == null || target[ind].classList.contains('white')) return true;
            if (checkForbid && target[ind].classList.contains('forbidden')) {
                target[ind].classList.replace('empty', 'black');
                checkEveryForbidden(false);
                const pos = getIndexByBox(target[ind]);
                const testC = checkForbidden(pos.x, pos.y, true);
                if (testC[0] >= 2 || testC[1] >= 2 || testC[2]) return true;
            }
            return false;
        }
        if (ansV == 3) return target[ind]?.classList.contains('black');
        if (ansV == 12) {
            if (target[ind] == null || target[ind].classList.contains('white')) min2C++;
            if (checkForbid && target[ind]?.classList.contains('forbidden')) {
                target[ind].classList.replace('empty', 'black');
                checkEveryForbidden(false);
                const pos = getIndexByBox(target[ind]);
                const testC = checkForbidden(pos.x, pos.y, true);
                if (testC[0] >= 2 || testC[1] >= 2 || testC[2]) min2C++;
            }
            if (target[ind]?.classList.contains('black')) return false;
            if (min2C == 2) return false;
            return true;
        }
        return false;
    };
    if (reverse) {
        const con1 = pats.some((ansA) => {
            min2C = 0;
            return ansA.every(matchingCallBack);
        });
        const con2 = pats.some((ansA) => {
            min2C = 0;
            reversePat = ansA;
            reversePat.reverse();
            return reversePat.every(matchingCallBack);
        });
        return con1 || con2;
    } else return pats.some((ansA) => {
        min2C = 0;
        return ansA.every(matchingCallBack);
    });
}

function checkForbidden(x, y, testCheck = false) {
    //console.log('금수호출!!');
    //좌 좌상 상 우상
    if (getBoxByIndex(x, y) == null || getBoxByIndex(x, y)?.style.backgroundColor != '') return [0, 0, false];
    if (!testCheck && !getBoxByIndex(x, y)?.classList.contains('empty')) return [0, 0, false];
    getBoxByIndex(x, y).classList.replace('empty', 'black');
    let checkLists = [[], [], [], []];

    for (let j = 4; j > 0; j--) {
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
    for (let j = 0; j < 5; j++) {
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
    for (let K = 0; K < 4; K++) {
        let res = [];
        res[0] = matchPattern(checkLists[K], threePats, false, testCheck);
        res[1] = matchPattern(checkLists[K], fourPats, true, testCheck);
        res[2] = matchPattern(checkLists[K], longPats, true, testCheck);

        //console.log(K);
        //console.log(res);

        tC += res[0];
        fC += res[1];
        l = l || res[2];
    }

    getBoxByIndex(x, y).classList.replace('black', 'empty');

    //console.log(checkLists);
    return [tC, fC, l];
}

function checkEveryForbidden(testCheck) {
    for (let i = 0; i < tableSize; i++) {
        for (let j = 0; j < tableSize; j++) {
            const testC = checkForbidden(i, j, testCheck);
            const st = getBoxByIndex(i, j);
            if (testC[0] >= 2 || testC[1] >= 2 || testC[2]) {
                //console.log('%d %d 금수', i, j);
                st.classList.add('forbidden');
            } else {
                st.classList.remove('forbidden');
            }
        }
    }
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

window.addEventListener('resize', initSize);

undoBtn.addEventListener('click', () => {
    if (lastBox.length == 0) return;
    lastBox[lastBox.length - 1].style.borderRadius = '0';
    const color = lastBox[lastBox.length - 1].style.backgroundColor;
    lastBox[lastBox.length - 1].style.backgroundColor = '';
    lastBox[lastBox.length - 1].classList.replace(color, 'empty');
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
});

backBtn.addEventListener('click', () => {
    window.location.href = '../';
});