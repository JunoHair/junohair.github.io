const title = document.getElementById('title');
const menu = document.getElementsByClassName('menu').item(0);

const menuItems = document.querySelectorAll('.item');
const contents = document.querySelectorAll('.box-content > [class^=content]');

let currentMenu = 0;

title.addEventListener('click', () => {
    alert('뭘 눌러 임마');
});

menu.addEventListener('click', () => {
    const sm = document.getElementsByClassName('menu-side').item(0);
    if (sm.classList.contains('show')) {
        sm.classList.remove('show');
        sm.classList.add('hide');
    } else {
        sm.classList.remove('hide');
        sm.classList.add('show');
    }
});

for (let i = 0; i < menuItems.length; i++) {
    menuItems.item(i).addEventListener('click', () => {
        contents.item(currentMenu).classList.remove('show');
        contents.item(currentMenu).classList.add('hide');
        contents.item(i).classList.remove('hide');
        contents.item(i).classList.add('show');
        currentMenu = i;
    });
}