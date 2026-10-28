let lightbox = null;
let lightboxImg = null;
let lightboxCaption = null;

document.addEventListener('DOMContentLoaded', function () {
    initBackgroundSwitch();
    initSidebarNav();
    initLightbox();
});

function initSidebarNav() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('section[id]');
    const backToTopBtn = document.getElementById('backToTop');
    const sidebarMainBtn = document.getElementById('sidebarMainBtn');
    const sidebarFloat = document.getElementById('sidebarFloat');

    if (!sidebarItems.length) return;

    sidebarItems.forEach(function (item) {
        const label = item.querySelector('.item-label');
        if (!label) return;
        document.body.appendChild(label);

        item.addEventListener('mouseenter', function () {
            const rect = this.getBoundingClientRect();
            label.style.left = (rect.right + 10) + 'px';
            label.style.top = (rect.top + rect.height / 2) + 'px';
            label.style.transform = 'translateY(-50%)';
            label.classList.add('show');
        });

        item.addEventListener('mouseleave', function () {
            label.classList.remove('show');
        });
    });

    sidebarItems.forEach(function (item) {
        item.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (href.includes('/') && !href.startsWith('#')) {
                if (window.innerWidth <= 768 && sidebarFloat) {
                    sidebarFloat.classList.remove('active');
                    if (sidebarMainBtn) sidebarMainBtn.classList.remove('active');
                }
                return;
            }

            e.preventDefault();
            const targetId = href.startsWith('#') ? href.substring(1) : href.split('#')[1];
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (window.innerWidth <= 768 && sidebarFloat) {
                    sidebarFloat.classList.remove('active');
                    if (sidebarMainBtn) sidebarMainBtn.classList.remove('active');
                }
            }
        });
    });

    if (sidebarMainBtn && sidebarFloat) {
        sidebarMainBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebarFloat.classList.toggle('active');
            this.classList.toggle('active');
        });

        document.addEventListener('click', function (e) {
            if (window.innerWidth <= 768 &&
                sidebarFloat.classList.contains('active') &&
                !sidebarFloat.contains(e.target)) {
                sidebarFloat.classList.remove('active');
                if (sidebarMainBtn) sidebarMainBtn.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', function () {
        let current = '';
        const scrollPosition = window.scrollY + 200;

        sections.forEach(function (section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        sidebarItems.forEach(function (item) {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === current) {
                item.classList.add('active');
            }
        });

        if (window.scrollY > 300) {
            if (backToTopBtn) backToTopBtn.classList.add('show');
        } else {
            if (backToTopBtn) backToTopBtn.classList.remove('show');
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function initBackgroundSwitch() {
    const layers = document.querySelectorAll('.bg-layer');
    let current = 0;
    let lastScrollTop = 0;
    const threshold = 500;
    let animating = false;

    if (layers.length < 2) return;

    // 第二张背景等真的滚动了再拉，首屏不为它买单
    let warmed = false;
    const warm = function () {
        if (warmed) return;
        warmed = true;
        layers.forEach(function (layer) {
            const src = layer.dataset.bg;
            if (src && !layer.style.backgroundImage) {
                layer.style.backgroundImage = 'url("' + src + '")';
            }
        });
    };
    window.addEventListener('scroll', warm, { passive: true, once: true });
    window.addEventListener('wheel', warm, { passive: true, once: true });
    window.addEventListener('touchmove', warm, { passive: true, once: true });

    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const diff = Math.abs(scrollTop - lastScrollTop);

        if (animating || diff < threshold) {
            lastScrollTop = scrollTop;
            return;
        }

        if (scrollTop > lastScrollTop) {
            layers[current].classList.remove('active');
            current = (current + 1) % layers.length;
            layers[current].classList.add('active');
        } else {
            layers[current].classList.remove('active');
            current = (current - 1 + layers.length) % layers.length;
            layers[current].classList.add('active');
        }

        lastScrollTop = scrollTop;
        animating = true;
        setTimeout(function () { animating = false; }, 1500);
    });
}

function initLightbox() {
    createLightboxDOM();
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLightbox();
    });
}

function createLightboxDOM() {
    if (document.getElementById('imageLightbox')) {
        lightbox = document.getElementById('imageLightbox');
        lightboxImg = document.getElementById('lightboxImage');
        lightboxCaption = document.getElementById('lightboxCaption');
        return;
    }

    lightbox = document.createElement('div');
    lightbox.id = 'imageLightbox';
    lightbox.className = 'lightbox';
    lightbox.onclick = closeLightbox;

    const closeBtn = document.createElement('span');
    closeBtn.className = 'lightbox-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = closeLightbox;
    lightbox.appendChild(closeBtn);

    lightboxImg = document.createElement('img');
    lightboxImg.className = 'lightbox-content';
    lightboxImg.id = 'lightboxImage';
    lightboxImg.onclick = function (e) { e.stopPropagation(); };
    lightbox.appendChild(lightboxImg);

    lightboxCaption = document.createElement('div');
    lightboxCaption.className = 'lightbox-caption';
    lightboxCaption.id = 'lightboxCaption';
    lightboxCaption.onclick = function (e) { e.stopPropagation(); };
    lightbox.appendChild(lightboxCaption);

    document.body.appendChild(lightbox);
}

window.openLightbox = function (imageUrl, title) {
    if (!lightbox) initLightbox();
    lightbox.style.display = 'flex';
    lightboxImg.src = imageUrl;
    lightboxCaption.textContent = title || '';
    document.body.style.overflow = 'hidden';
};

window.closeLightbox = function () {
    if (!lightbox) return;
    lightbox.style.display = 'none';
    lightboxImg.src = '';
    lightboxCaption.textContent = '';
    document.body.style.overflow = 'auto';
};
