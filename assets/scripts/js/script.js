/*Observador de elementos Fades*/

const fades = document.querySelectorAll('.fade');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        }
    });
});
    
fades.forEach(el => observer.observe(el));

function initSlider() {
    const container = document.getElementById('lan-slide-area');
    const track = document.getElementById('slide-track');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    if (!container || !track)
        return;
    let autoplayInterval = 5000;
    let timer;
    let isTransitioning = false;
    let currentTransitionEnd = null;
    const getSlides = () => Array.from(track.children);
    function setSizes() {
        const slides = getSlides();
        const rect = container.getBoundingClientRect();
        const style = window.getComputedStyle(container);
        const paddingLeft = parseFloat(style.paddingLeft) || 0;
        const paddingRight = parseFloat(style.paddingRight) || 0;
        const width = Math.max(0, Math.floor(rect.width - paddingLeft - paddingRight));
        slides.forEach(s => {
            s.style.width = width + 'px';
            s.style.minWidth = width + 'px';
        });
        track.style.width = (width * slides.length) + 'px';
    }
    function resetTimer() {
        if (timer)
            window.clearInterval(timer);
        timer = window.setInterval(() => nextSlide(), autoplayInterval);
    }
    
    // remove listener anterior se existir
    function removeTransitionListener() {
        if (currentTransitionEnd) {
            track.removeEventListener('transitionend', currentTransitionEnd);
            currentTransitionEnd = null;
        }
    }

    function nextSlide() {
        if (isTransitioning) return;
        const slides = getSlides();
        if (slides.length === 0) return;

        isTransitioning = true;

        const firstSlide = slides[0];
        if (!firstSlide) {
            isTransitioning = false;
            return;
        }

        const width = firstSlide.clientWidth;

        // anima para a esquerda
        track.style.transition = 'transform 0.5s ease';
        track.style.transform = `translateX(-${width}px)`;

        const onEnd = (e) => {
            if (e.target !== track) return; // evita múltiplos disparos
            removeTransitionListener();

            // 1️⃣ remove transição
            track.style.transition = 'none';

            // 2️⃣ reorganiza o DOM
            const first = track.firstElementChild;
            if (first) track.appendChild(first);

            // 3️⃣ reseta posição
            track.style.transform = 'translateX(0)';

            // 4️⃣ força reflow
            track.offsetHeight;

            // 5️⃣ reativa transição
            track.style.transition = 'transform 0.5s ease';

            isTransitioning = false;
            clearTimeout(transitionTimeout);
        };

        removeTransitionListener();
        currentTransitionEnd = onEnd;
        track.addEventListener('transitionend', onEnd);
        
        // FALLBACK: se transitionend não dispara (bug em alguns mobiles), liberta após 600ms
        let transitionTimeout = setTimeout(() => {
            removeTransitionListener();
            isTransitioning = false;
        }, 600);
    }
    function prevSlide() {
        if (isTransitioning)
            return;
        const slides = getSlides();
        if (slides.length === 0)
            return;
        isTransitioning = true;
        const firstSlide = slides[0];
        if (!firstSlide) {
            isTransitioning = false;
            return;
        }
        const width = firstSlide.clientWidth;
        
        // Move last slide to front instantly, then animate to position 0
        track.style.transition = 'none';
        const last = track.lastElementChild;
        if (last)
            track.insertBefore(last, track.firstElementChild);
        
        // set transform so first (just moved) is out of view to the left
        track.style.transform = `translateX(-${width}px)`;
        
        // força reflow para garantir que a mudança de transform anterior seja aplicada
        track.offsetHeight;
        
        // next frame animate to 0
        requestAnimationFrame(() => {
            track.style.transition = 'transform 0.5s ease';
            track.style.transform = 'translateX(0)';
        });
        
        const onEnd = (e) => {
            if (e.target !== track) return; // crucial para prevSlide também!
            removeTransitionListener();
            track.style.transition = 'none';
            isTransitioning = false;
        };
        
        removeTransitionListener();
        currentTransitionEnd = onEnd;
        track.addEventListener('transitionend', onEnd);
        
        // FALLBACK: se transitionend não dispara em mobile, liberta após 600ms
        let transitionTimeout = setTimeout(() => {
            if (isTransitioning) {
                removeTransitionListener();
                track.style.transition = 'none';
                isTransitioning = false;
            }
        }, 600);
    }
    btnNext === null || btnNext === void 0 ? void 0 : btnNext.addEventListener('click', () => {
        resetTimer();
        nextSlide();
    });
    btnPrev === null || btnPrev === void 0 ? void 0 : btnPrev.addEventListener('click', () => {
        resetTimer();
        prevSlide();
    });

    // Suporte a touch/swipe no mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwipeProcessing = false; // previne múltiplos disparos simultâneos
    const minSwipeDistance = 50; // distância mínima para detectar swipe

    function handleSwipe() {
        // evita múltiplos disparos simultâneos (pointer + touch)
        if (isSwipeProcessing || isTransitioning) {
            return;
        }

        const deltaX = touchEndX - touchStartX;
        const deltaY = Math.abs(touchEndY - touchStartY);

        // ignora se movimento vertical for maior que horizontal (scroll da página)
        if (Math.abs(deltaX) < minSwipeDistance || deltaY > Math.abs(deltaX)) {
            return;
        }

        isSwipeProcessing = true;

        // swipe para frente (esquerda) = next slide
        if (deltaX < 0) {
            resetTimer();
            nextSlide();
        }
        // swipe para trás (direita) = prev slide
        else if (deltaX > 0) {
            resetTimer();
            prevSlide();
        }

        // libera processamento após a transição
        setTimeout(() => {
            isSwipeProcessing = false;
        }, 500);
    }

    // usar apenas pointer events (compatível com desktop, tablet e mobile)
    let isPointerDown = false;

    container.addEventListener('pointerdown', (e) => {
        isPointerDown = true;
        touchStartX = e.clientX;
        touchStartY = e.clientY;
    });

    container.addEventListener('pointerup', (e) => {
        if (!isPointerDown) return;
        isPointerDown = false;
        touchEndX = e.clientX;
        touchEndY = e.clientY;
        handleSwipe();
    });

    // evitar que pointer events interfiram em elementos como links/botões
    container.addEventListener('pointercancel', () => {
        isPointerDown = false;
    });

    window.addEventListener('load', () => {
        setSizes();
        resetTimer();
    });
    window.addEventListener('resize', () => {
        setSizes();
    });
    // initial sizing
    setSizes();
}
initSlider();

