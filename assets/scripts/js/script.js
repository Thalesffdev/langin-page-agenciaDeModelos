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
    const getSlides = () => Array.from(track.children);
    function setSizes() {
        const slides = getSlides();
        const width = container.clientWidth;
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
            track.removeEventListener('transitionend', onEnd);

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
        };

        track.addEventListener('transitionend', onEnd);
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
        // next frame animate to 0
        requestAnimationFrame(() => {
            track.style.transition = 'transform 0.5s ease';
            track.style.transform = 'translateX(0)';
        });
        const onEnd = () => {
            track.removeEventListener('transitionend', onEnd);
            track.style.transition = 'none';
            isTransitioning = false;
        };
        track.addEventListener('transitionend', onEnd, { once: true });
    }
    btnNext === null || btnNext === void 0 ? void 0 : btnNext.addEventListener('click', () => {
        resetTimer();
        nextSlide();
    });
    btnPrev === null || btnPrev === void 0 ? void 0 : btnPrev.addEventListener('click', () => {
        resetTimer();
        prevSlide();
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
//# sourceMappingURL=script.js.map