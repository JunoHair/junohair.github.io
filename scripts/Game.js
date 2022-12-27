const gameTableBox = document.getElementsByClassName('gameTable').item(0);
const table = document.createElement('table');
const resetBtn = document.getElementById('reset');
const backBtn = document.getElementById('back');
let tr, td;

function getTableByIndex(x, y) {
    return table.childNodes.item(y).childNodes.item(x);
}

for (i = 0; i < 19; i++) {
    tr = document.createElement('tr');
    for (j = 0; j < 19; j++) {
        td = document.createElement('td');
        td.addEventListener('click', (event) => {
            event.target.style.backgroundColor = 'black';
        });
        tr.appendChild(td);
    }
    table.appendChild(tr);
}
gameTableBox.appendChild(table);

resetBtn.addEventListener('click', () => {
    for (i = 0; i < 19; i++) {
        for (j = 0; j < 19; j++) {
            getTableByIndex(j, i).style.backgroundColor = '';
        }
    }
});

backBtn.addEventListener('click', () => {
    window.history.back();
});