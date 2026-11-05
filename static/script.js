const menuMobile = document.querySelector('.menu-mobile')
const body = document.querySelector('body')

menuMobile.addEventListener('click', () => {
    menuMobile.classList.contains("bi-list")
    ? menuMobile.classList.replace("bi-list", "bi-x")
    : menuMobile.classList.replace("bi-x", "bi-list");
    body.classList.toggle("menu-nav-active");
})

const navItem = document.querySelectorAll(".nav-item")

navItem.forEach(item => {
    item.addEventListener("click" , () =>{
        if (body.classList.contains("menu-nav-active")){
            body.classList.remove("menu-nav-active")
            menuMobile.classList.replace("bi-x", "bi-list")
        }
    })
})

// ===== SCROLL SUAVE PARA LINKS DO MENU =====
document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Remover active de todos os links
                menuLinks.forEach(l => l.classList.remove('active'));
                
                // Adicionar active no link clicado
                this.classList.add('active');
                
                // Remover classe visible dos elementos da seção para resetar animações
                const sectionElements = targetElement.querySelectorAll('.slide-up, .zoom-in, .trajetoria-item, .portfolio-card, .progress');
                sectionElements.forEach(el => {
                    el.classList.remove('visible');
                    const progressBar = el.querySelector('.progress-bar');
                    if (progressBar) {
                        progressBar.classList.remove('animate');
                    }
                });
                
                // Fazer scroll primeiro
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Aguardar scroll terminar e depois disparar animações
                setTimeout(() => {
                    sectionElements.forEach((el, index) => {
                        setTimeout(() => {
                            el.classList.add('visible');
                            
                            // Animar barra de progresso se existir
                            if (el.classList.contains('progress')) {
                                const progressBar = el.querySelector('.progress-bar');
                                if (progressBar && !progressBar.classList.contains('animate')) {
                                    const targetWidth = progressBar.style.width;
                                    progressBar.style.setProperty('--target-width', targetWidth);
                                    progressBar.classList.add('animate');
                                }
                            }
                        }, index * 50); // Pequeno delay entre cada elemento
                    });
                }, 900); // Tempo para scroll terminar
            }
        });
    });
});

// ===== EFEITO DE DIGITAÇÃO (TYPEWRITER) =====
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    // Criar cursor
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    element.classList.add('typewriter');
    element.appendChild(cursor);
    
    function type() {
        if (i < text.length) {
            const char = text.charAt(i);
            const textNode = document.createTextNode(char);
            element.insertBefore(textNode, cursor);
            i++;
            setTimeout(type, speed);
        } else {
            element.classList.add('finished');
        }
    }
    
    type();
}


// ===== INTERSECTION OBSERVER PARA ANIMAÇÕES AO SCROLL =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px 100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Se for barra de progresso, animar
            if (entry.target.classList.contains('progress')) {
                const progressBar = entry.target.querySelector('.progress-bar');
                if (progressBar && !progressBar.classList.contains('animate')) {
                    const targetWidth = progressBar.style.width;
                    progressBar.style.setProperty('--target-width', targetWidth);
                    progressBar.classList.add('animate');
                }
            }
        }
    });
}, observerOptions);

// Observar elementos quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    // Observar seção sobre e habilidades
    const sobreElements = document.querySelectorAll('#sobre .slide-up, #sobre .zoom-in, #habilidades .slide-up');
    sobreElements.forEach(el => observer.observe(el));
    
    // Observar barras de progresso
    const progressBars = document.querySelectorAll('.progress');
    progressBars.forEach(bar => observer.observe(bar));
    
    // Observar items do trajetória com observer otimizado
    const cvObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px 100px 0px'
    });
    
    const trajetoriaItems = document.querySelectorAll('.trajetoria-item');
    trajetoriaItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.2}s`;
        cvObserver.observe(item);
    });
    
    // Observar cards do portfólio
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    portfolioCards.forEach(card => {
        const delay = card.getAttribute('data-delay') || '0';
        card.style.transitionDelay = `${delay}s`;
        observer.observe(card);
    });
});

// ===== MODAL DE IMAGENS =====
document.addEventListener('DOMContentLoaded', () => {
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <span class="close-modal">&times;</span>
        <div class="modal-content-image">
            <img src="" alt="Imagem ampliada">
        </div>
    `;
    document.body.appendChild(modal);
    
    const modalImg = modal.querySelector('.modal-content-image img');
    const closeBtn = modal.querySelector('.close-modal');
    
    // Adicionar evento de click em todas as imagens do portfólio
    const portfolioImages = document.querySelectorAll('#portifolio img');
    portfolioImages.forEach(img => {
        img.classList.add('clickable-image');
        img.addEventListener('click', () => {
            modal.classList.add('show');
            modalImg.src = img.src;
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Fechar modal
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    });
    
    // Fechar ao clicar fora da imagem
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });
});

// ===== COPIAR E-MAIL AO CLICAR =====
const emailLink = document.getElementById('email-copy');
if (emailLink) {
    emailLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = emailLink.dataset.email || emailLink.textContent.trim();

        try {
            await navigator.clipboard.writeText(email);
        } catch (err) {
            // Fallback para navegadores sem Clipboard API
            const temp = document.createElement('textarea');
            temp.value = email;
            temp.style.position = 'fixed';
            temp.style.opacity = '0';
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            temp.remove();
        }

        emailLink.textContent = 'E-mail copiado!';
        setTimeout(() => {
            emailLink.textContent = email;
        }, 1500);
    });
}

// ===== MOSTRAR / ESCONDER CONTEÚDO DOS CARDS DE PROJETO =====
document.querySelectorAll('.btn-ver-mais').forEach(btn => {
    btn.addEventListener('click', () => {
        const card = btn.closest('.portfolio-card');
        const expanded = card.classList.toggle('expanded');
        btn.setAttribute('aria-expanded', expanded);
        btn.querySelector('.ver-mais-label').textContent = expanded ? 'Ver menos' : 'Ver mais';
        const icon = btn.querySelector('i');
        icon.classList.toggle('bi-chevron-down', !expanded);
        icon.classList.toggle('bi-chevron-up', expanded);

        if (expanded) {
            // Acompanha a abertura do card rolando até o final dele
            const cardTop = card.getBoundingClientRect().top + window.scrollY;
            const startY = window.scrollY;
            const start = performance.now();
            const duration = 950;

            const follow = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const target = cardTop + card.offsetHeight - window.innerHeight + 16;
                window.scrollTo(0, Math.max(startY, target));
                if (progress < 1) requestAnimationFrame(follow);
            };

            requestAnimationFrame(follow);
        } else {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== EXPANDIR / RECOLHER HARD SKILLS E SOFT SKILLS =====
document.querySelectorAll('.skills-header').forEach(header => {
    header.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = header.getAttribute('aria-expanded') === 'true';
        header.setAttribute('aria-expanded', !isOpen);

        const icon = header.querySelector('.skills-icon');
        if (icon) {
            icon.classList.toggle('bi-chevron-down', isOpen);
            icon.classList.toggle('bi-chevron-up', !isOpen);
        }

        const collapse = header.nextElementSibling;
        if (collapse && collapse.classList.contains('skills-collapse')) {
            collapse.classList.toggle('open', !isOpen);
        }
    });
});


// ===== EFEITO DE DIGITAÇÃO NOS DIVISORES =====
const typedDividers = document.querySelectorAll('.code-divider-typed');
const dividerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting || entry.target.dataset.typed) return;
        const el = entry.target;
        el.dataset.typed = '1';
        const text = el.dataset.text || '';
        let i = 0;
        const type = () => {
            el.textContent = text.slice(0, ++i);
            if (i < text.length) setTimeout(type, 55);
        };
        setTimeout(type, 250);
        dividerObserver.unobserve(el);
    });
}, { threshold: 0, rootMargin: '200px 0px 200px 0px' });

typedDividers.forEach(el => dividerObserver.observe(el));
