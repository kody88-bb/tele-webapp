const tabButtons = document.querySelectorAll('.tab-buttons button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    // 先移除所有按钮的 active 样式
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // 给当前点击的按钮和对应的内容添加 active 样式
    btn.classList.add('active');
    tabContents[index].classList.add('active');
  });
});


// 招聘岗位

const menuItems = document.querySelectorAll('.sidebar li');
const contentItems = document.querySelectorAll('.main-content .content');

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    // 切换菜单激活样式
    menuItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // 获取目标内容 ID
    const target = item.getAttribute('data-target');

    // 切换右侧内容显示
    contentItems.forEach(content => {
      content.classList.remove('active');
      if (content.id === target) {
        content.classList.add('active');
      }
    });
  });
});


// 轮播

const slides = document.querySelector('.slides');
const images = slides.querySelectorAll('img');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let index = 0;
const total = images.length;

function showSlide(i) {
  index = (i + total) % total; // 支持循环
  slides.style.transform = `translateX(-${index * 100}%)`;
}

// 手动控制
prevBtn.addEventListener('click', () => showSlide(index - 1));
nextBtn.addEventListener('click', () => showSlide(index + 1));

// 自动播放
let timer = setInterval(() => showSlide(index + 1), 3000);

// 暂停播放（可选）
document.querySelector('.carousel').addEventListener('mouseenter', () => clearInterval(timer));
document.querySelector('.carousel').addEventListener('mouseleave', () => {
  timer = setInterval(() => showSlide(index + 1), 3000);
});