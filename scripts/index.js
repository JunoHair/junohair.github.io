const title = document.getElementById('title');
const menu = document.getElementsByClassName('menu').item(0);
const screenWrap = document.querySelector('.wrapper-screen');

const menuItems = document.querySelectorAll('.item');
const contents = document.querySelectorAll('.box-content > [class^=content]');

let currentMenu = 0;

title.addEventListener('click', () => {
    alert('뭘 눌러 임마');
});

function showMenu() {
    const sm = document.getElementsByClassName('box-menu').item(0);
    if (sm.classList.contains('show')) {
        sm.classList.remove('show');
        sm.classList.add('hide');
        screenWrap.style.display = 'none';
    } else {
        sm.classList.remove('hide');
        sm.classList.add('show');
        screenWrap.style.display = 'block';
    }
}

menu.addEventListener('click', showMenu);

for (let i = 0; i < menuItems.length; i++) {
    menuItems.item(i).addEventListener('click', () => {
        contents.item(currentMenu).classList.remove('show');
        contents.item(currentMenu).classList.add('hide');
        contents.item(i).classList.remove('hide');
        contents.item(i).classList.add('show');
        currentMenu = i;
        showMenu();
    });
}