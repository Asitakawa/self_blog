// 主要的JavaScript文件

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('博客页面已加载');
    
    // 背景图片滚动切换功能
    initBackgroundSwitch();
    
    // 侧边栏导航功能
    initSidebarNav();
});

// 侧边栏导航功能
function initSidebarNav() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('section[id]');
    const backToTopBtn = document.getElementById('backToTop');
    const sidebarMainBtn = document.getElementById('sidebarMainBtn');
    const sidebarFloat = document.getElementById('sidebarFloat');
    
    if (!sidebarItems.length) return;
    
    // 为每个侧边栏项添加鼠标悬停事件，动态定位标签
    sidebarItems.forEach(item => {
        const label = item.querySelector('.item-label');
        if (!label) return;
        
        // 将标签移动到body下，避免受父元素层叠上下文影响
        document.body.appendChild(label);
        label.classList.add('label-tooltip');
        label.classList.remove('item-label');
        
        item.addEventListener('mouseenter', function() {
            // 获取图标的位置
            const rect = this.getBoundingClientRect();
            
            // 计算标签位置：图标右侧
            const left = rect.right + 10; // 图标右侧 + 10px间距
            const top = rect.top + (rect.height / 2); // 垂直居中
            
            // 设置标签位置
            label.style.left = left + 'px';
            label.style.top = top + 'px';
            label.style.transform = 'translateY(-50%)';
            
            // 显示标签
            label.classList.add('show');
        });
        
        item.addEventListener('mouseleave', function() {
            // 隐藏标签
            label.classList.remove('show');
        });
    });
    
    // 点击导航链接
    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // 如果是外部链接（包含/但不是#开头），允许正常跳转
            if (href.includes('/') && !href.startsWith('#')) {
                // 允许默认行为，跳转到其他页面
                return;
            }
            
            // 当前页面的锚点链接，阻止默认行为并平滑滚动
            e.preventDefault();
            const targetId = href.startsWith('#') ? href.substring(1) : href.split('#')[1];
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // 平滑滚动
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // 移动端关闭侧边栏（如果需要）
                if (window.innerWidth <= 768) {
                    sidebarFloat.classList.remove('active');
                    if (sidebarMainBtn) {
                        sidebarMainBtn.classList.remove('active');
                    }
                }
            }
        });
    });
    
    // 主按钮点击切换（移动端使用）
    if (sidebarMainBtn && sidebarFloat) {
        sidebarMainBtn.addEventListener('click', function() {
            sidebarFloat.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // 滚动时高亮当前模块
    window.addEventListener('scroll', function() {
        let current = '';
        const scrollPosition = window.scrollY + 200;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        sidebarItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === current) {
                item.classList.add('active');
            }
        });
        
        // 显示/隐藏返回顶部按钮
        if (window.scrollY > 300) {
            if (backToTopBtn) {
                backToTopBtn.classList.add('show');
            }
        } else {
            if (backToTopBtn) {
                backToTopBtn.classList.remove('show');
            }
        }
    });
    
    // 返回顶部
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// 背景图片切换功能
function initBackgroundSwitch() {
    const backgrounds = document.querySelectorAll('.background-image');
    let currentBg = 0;
    let lastScrollTop = 0;
    let switchThreshold = 500; // 滚动多少像素后切换背景
    let isAnimating = false;
    
    if (backgrounds.length === 0) return;
    
    // 预加载所有背景图片，避免切换时闪烁
    backgrounds.forEach(bg => {
        const imageUrl = bg.style.backgroundImage.replace(/url\(["']?([^"')]+)["']?\)/, '$1');
        if (imageUrl && imageUrl !== 'none') {
            const img = new Image();
            img.src = imageUrl;
        }
    });
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDiff = Math.abs(scrollTop - lastScrollTop);
        
        // 防止动画期间重复切换
        if (isAnimating) {
            lastScrollTop = scrollTop;
            return;
        }
        
        // 检查是否达到切换阈值
        if (scrollDiff >= switchThreshold) {
            // 判断滚动方向
            if (scrollTop > lastScrollTop) {
                // 向下滚动：切换到下一张
                switchBackground(1);
            } else if (scrollTop < lastScrollTop) {
                // 向上滚动：切换到上一张
                switchBackground(-1);
            }
            lastScrollTop = scrollTop;
        }
    });
    
    function switchBackground(direction) {
        if (isAnimating) return;
        
        isAnimating = true;
        
        // 移除当前背景的active类
        backgrounds[currentBg].classList.remove('active');
        
        // 根据方向切换背景
        if (direction === 1) {
            // 向下：前进
            currentBg = (currentBg + 1) % backgrounds.length;
        } else {
            // 向上：后退
            currentBg = (currentBg - 1 + backgrounds.length) % backgrounds.length;
        }
        
        // 添加新的active类
        backgrounds[currentBg].classList.add('active');
        
        // 动画结束后重置标志
        setTimeout(function() {
            isAnimating = false;
        }, 1500); // 与CSS transition时间一致
    }
}

// 示例：平滑滚动到顶部
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 示例：显示加载提示
function showLoading(message = '加载中...') {
    // 可以集成Bootstrap的toast或modal组件
    console.log(message);
}
