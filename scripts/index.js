const title = document.getElementById('title');
const menu = document.getElementsByClassName('menu').item(0);

const menuItems = document.querySelectorAll('.item');
const contents = document.querySelectorAll('.box-content > [class^=content]');

let currentMenu = 0;

title.addEventListener('click', () => {
    alertModal('뭘 눌러 임마');
});

menu.addEventListener('mouseover', () => {
    menu.style.width = '200px';
});
menu.addEventListener('mouseout', () => {
    menu.style.width = '50px';
});

for (let i = 0; i < menuItems.length; i++) {
    menuItems.item(i).addEventListener('click', () => {
        contents.item(currentMenu).classList.remove('show');
        contents.item(currentMenu).classList.add('hide');
        menuItems.item(currentMenu).classList.remove('show');
        menuItems.item(currentMenu).classList.add('hide');
        contents.item(i).classList.remove('hide');
        contents.item(i).classList.add('show');
        menuItems.item(i).classList.remove('hide');
        menuItems.item(i).classList.add('show');
        currentMenu = i;
        menu.style.width = '50px';
    });
}