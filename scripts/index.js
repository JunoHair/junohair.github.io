const title = document.getElementById('title');
const menu = document.getElementsByClassName('menu').item(0);


title.addEventListener('click', () => {
    alert('뭘 눌러 임마');
})

menu.addEventListener('click', () => {
    const sm = document.getElementsByClassName('side-menu').item(0);
    if (sm.classList.contains('show')) {
        sm.classList.remove('show');
        sm.classList.add('hide');
    } else {
        sm.classList.remove('hide');
        sm.classList.add('show');
    }
})