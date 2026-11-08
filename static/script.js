'use strict';

const body = document.body;
const menuMobile = document.querySelector('.menu-mobile');
const header = document.getElementById('header');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== MENU LATERAL (MOBILE) =====
function isMenuOpen() {
    return body.classList.contains('menu-nav-active');
}

function setMenu(open, { restoreFocus = false } = {}) {
    body.classList.toggle('menu-nav-active', open);

    if (!menuMobile) return;

    menuMobile.classList.toggle('bi-list', !open);
    menuMobile.classList.toggle('bi-x', open);
    menuMobile.setAttribute('aria-expanded', String(open));
    menuMobile.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');

    if (open) {
        // espera o drawer ficar visível antes de mover o foco
        setTimeout(() => {
            if (!isMenuOpen()) return;
            const activeLink = header?.querySelector('.nav-menu a.active');
            const firstLink = header?.querySelector('.nav-menu a');
            (activeLink || firstLink)?.focus({ preventScroll: true });
        }, 80);
    } else if (restoreFocus) {
        menuMobile.focus({ preventScroll: true });
    }
}

menuMobile?.addEventListener('click', () => {
    setMenu(!isMenuOpen());
});

document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
        if (isMenuOpen()) setMenu(false, { restoreFocus: true });
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isMenuOpen()) {
        setMenu(false, { restoreFocus: true });
    }
});

document.addEventListener('click', (event) => {
    if (!isMenuOpen()) return;
    if (header?.contains(event.target) || menuMobile?.contains(event.target)) return;
    setMenu(false);
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && isMenuOpen()) setMenu(false);
});

// ===== NAVEGAÇÃO COM SCROLL SUAVE =====
const menuLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

menuLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');
        const target = targetId ? document.querySelector(targetId) : null;
        if (!target) return;

        event.preventDefault();

        menuLinks.forEach((item) => {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
        });
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');

        target.querySelectorAll('.slide-up, .portfolio-card, .trajetoria-item').forEach((el) => {
            el.classList.add('visible');
        });

        target.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            block: 'start',
        });
    });
});

// ===== ANIMAÇÕES DE ENTRADA AO ROLAR =====
const revealElements = document.querySelectorAll(
    '#sobre .slide-up, #habilidades .slide-up, .trajetoria-item, .portfolio-card',
);

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px 100px 0px',
        },
    );

    revealElements.forEach((element) => {
        if (element.classList.contains('portfolio-card')) {
            const delay = element.getAttribute('data-delay') || '0';
            element.style.transitionDelay = reduceMotion ? '0s' : `${delay}s`;
        }
        revealObserver.observe(element);
    });
} else {
    revealElements.forEach((element) => element.classList.add('visible'));
}

// ===== MODAL DE IMAGENS =====
const modal = document.createElement('div');
modal.className = 'image-modal';
modal.setAttribute('role', 'dialog');
modal.setAttribute('aria-modal', 'true');
modal.setAttribute('aria-label', 'Visualização ampliada da imagem');
modal.innerHTML = `
    <button type="button" class="close-modal" aria-label="Fechar imagem">&times;</button>
    <div class="modal-content-image">
        <img alt="">
    </div>
`;
document.body.appendChild(modal);

const modalImage = modal.querySelector('.modal-content-image img');
const modalClose = modal.querySelector('.close-modal');
let lastFocusedElement = null;
let previousBodyOverflow = '';

function openImageModal(image) {
    lastFocusedElement = document.activeElement;
    modalImage.src = image.currentSrc || image.src;
    modalImage.alt = image.alt || 'Imagem ampliada';
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modal.classList.add('show');
    modalClose.focus({ preventScroll: true });
}

function closeImageModal() {
    modal.classList.remove('show');
    modalImage.removeAttribute('src');
    document.body.style.overflow = previousBodyOverflow;
    lastFocusedElement?.focus?.({ preventScroll: true });
}

modalClose.addEventListener('click', closeImageModal);

modal.addEventListener('click', (event) => {
    if (event.target === modal) closeImageModal();
});

modal.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    modalClose.focus();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('show')) {
        closeImageModal();
    }
});

document.querySelectorAll('img.card-img-top, .app-screenshot-container img').forEach((image) => {
    image.classList.add('clickable-image');
    image.setAttribute('role', 'button');
    image.setAttribute('tabindex', '0');
    image.setAttribute('aria-haspopup', 'dialog');
    image.setAttribute('aria-label', `Ampliar imagem: ${image.alt}`);

    image.addEventListener('click', () => openImageModal(image));
    image.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openImageModal(image);
    });
});

// ===== COPIAR E-MAIL AO CLICAR =====
const emailLink = document.getElementById('email-copy');

if (emailLink) {
    emailLink.addEventListener('click', async (event) => {
        event.preventDefault();
        const email = emailLink.dataset.email || emailLink.textContent.trim();

        try {
            await navigator.clipboard.writeText(email);
        } catch {
            // Fallback para navegadores sem Clipboard API
            const temporaryInput = document.createElement('textarea');
            temporaryInput.value = email;
            temporaryInput.style.position = 'fixed';
            temporaryInput.style.opacity = '0';
            document.body.appendChild(temporaryInput);
            temporaryInput.select();
            document.execCommand('copy');
            temporaryInput.remove();
        }

        emailLink.textContent = 'E-mail copiado!';
        setTimeout(() => {
            emailLink.textContent = email;
        }, 1800);
    });
}

// ===== MOSTRAR / ESCONDER CONTEÚDO DOS CARDS =====
document.querySelectorAll('.btn-ver-mais').forEach((button, index) => {
    const card = button.closest('.portfolio-card');
    const content = card?.querySelector('.card-content');
    if (!card || !content) return;

    const contentId = `card-content-${index + 1}`;
    content.id = contentId;
    content.setAttribute('aria-hidden', 'true');
    content.inert = true;
    button.setAttribute('aria-controls', contentId);

    button.addEventListener('click', () => {
        const expanded = card.classList.toggle('expanded');

        button.setAttribute('aria-expanded', String(expanded));
        content.setAttribute('aria-hidden', String(!expanded));
        content.inert = !expanded;

        button.querySelector('.ver-mais-label').textContent = expanded ? 'Ver menos' : 'Ver mais';

        const icon = button.querySelector('i');
        icon.classList.toggle('bi-chevron-down', !expanded);
        icon.classList.toggle('bi-chevron-up', expanded);

        if (expanded) {
            // Acompanha a abertura do card rolando até o final dele
            const cardTop = card.getBoundingClientRect().top + window.scrollY;
            const startY = window.scrollY;
            const start = performance.now();
            const duration = reduceMotion ? 0 : 950;

            const follow = (now) => {
                const elapsed = duration === 0 ? duration : now - start;
                const progress = duration === 0 ? 1 : Math.min(elapsed / duration, 1);
                const target = cardTop + card.offsetHeight - window.innerHeight + 16;
                window.scrollTo(0, Math.max(startY, target));

                if (progress < 1) requestAnimationFrame(follow);
            };

            requestAnimationFrame(follow);
        } else {
            card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
    });
});

// ===== EXPANDIR / RECOLHER HARD SKILLS E SOFT SKILLS =====
document.querySelectorAll('.skills-header').forEach((skillsHeader, index) => {
    const collapse = skillsHeader.nextElementSibling;
    if (!collapse?.classList.contains('skills-collapse')) return;

    const collapseId = `skills-collapse-${index + 1}`;
    collapse.id = collapseId;
    collapse.setAttribute('aria-hidden', 'true');
    collapse.inert = true;
    skillsHeader.setAttribute('aria-controls', collapseId);

    const toggle = () => {
        const isOpen = skillsHeader.getAttribute('aria-expanded') === 'true';

        skillsHeader.setAttribute('aria-expanded', String(!isOpen));
        collapse.classList.toggle('open', !isOpen);
        collapse.setAttribute('aria-hidden', String(isOpen));
        collapse.inert = isOpen;

        const icon = skillsHeader.querySelector('.skills-icon');
        if (icon) {
            icon.classList.toggle('bi-chevron-down', isOpen);
            icon.classList.toggle('bi-chevron-up', !isOpen);
        }
    };

    skillsHeader.addEventListener('click', toggle);
    skillsHeader.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggle();
    });
});

// ===== EFEITO DE DIGITAÇÃO NOS DIVISORES =====
const typedDividers = document.querySelectorAll('.code-divider-typed');

if (reduceMotion) {
    typedDividers.forEach((element) => {
        element.textContent = element.dataset.text || '';
    });
} else if ('IntersectionObserver' in window) {
    const dividerObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting || entry.target.dataset.typed) return;

                const element = entry.target;
                element.dataset.typed = '1';
                const text = element.dataset.text || '';
                let index = 0;

                const type = () => {
                    element.textContent = text.slice(0, ++index);
                    if (index < text.length) setTimeout(type, 55);
                };

                setTimeout(type, 250);
                dividerObserver.unobserve(element);
            });
        },
        { threshold: 0, rootMargin: '200px 0px 200px 0px' },
    );

    typedDividers.forEach((element) => dividerObserver.observe(element));
} else {
    typedDividers.forEach((element) => {
        element.textContent = element.dataset.text || '';
    });
}
