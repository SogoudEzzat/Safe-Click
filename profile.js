const menu = document.querySelector('#mobile-menu');
const navList = document.querySelector('#nav-list');

// فتح وقفل المينيو
menu.addEventListener('click', () => {
    navList.classList.toggle('active');
    menu.classList.toggle('open'); // للأنيميشن
});

// إغلاق القائمة عند الضغط على أي رابط
document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('active');
        menu.classList.remove('open');
    });
});

// إغلاق المينيو عند الضغط خارجه
document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !navList.contains(e.target)) {
        navList.classList.remove('active');
        menu.classList.remove('open');
    }
});