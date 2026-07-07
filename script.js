// Ensure DOM is loaded
document.addEventListener("DOMContentLoaded", (event) => {
    // ==========================================
    // Theme Toggle Logic
    // ==========================================
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Initialize Theme
    if (currentTheme == 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else if (currentTheme == 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else if (!prefersDarkScheme.matches) {
        // If no local storage and system prefers light, set to light. (Default is dark)
        document.documentElement.setAttribute('data-theme', 'light');
    }

    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'light') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    // ==========================================
    // 1. Initialize Lenis Smooth Scrolling
    // ==========================================
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);

    // ==========================================
    // 2. Custom Cursor
    // ==========================================
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    // Check if it's a touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice && cursor && cursorFollower) {
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth follow animation
        gsap.ticker.add(() => {
            // Main cursor (instant)
            cursorX += (mouseX - cursorX) * 1;
            cursorY += (mouseY - cursorY) * 1;
            gsap.set(cursor, { x: cursorX, y: cursorY });

            // Follower (lagged)
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            gsap.set(cursorFollower, { x: followerX, y: followerY });
        });

        // Hover states for links and magnetic items
        const hoverElements = document.querySelectorAll('a, button, .magnetic');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                cursorFollower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                cursorFollower.classList.remove('hover');
            });
        });
    }

    // ==========================================
    // 3. Magnetic Buttons
    // ==========================================
    const magneticEls = document.querySelectorAll('.magnetic');
    
    magneticEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const position = el.getBoundingClientRect();
            const x = e.clientX - position.left - position.width / 2;
            const y = e.clientY - position.top - position.height / 2;
            
            gsap.to(el, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.5,
                ease: "power2.out"
            });
            
            // Move text inside if available
            const text = el.querySelector('.link-text, .text');
            if (text) {
                gsap.to(text, {
                    x: x * 0.1,
                    y: y * 0.1,
                    duration: 0.5,
                    ease: "power2.out"
                });
            }
        });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
            
            const text = el.querySelector('.link-text, .text');
            if (text) {
                gsap.to(text, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.3)"
                });
            }
        });
    });

    // ==========================================
    // 4. Hero Entry Animations
    // ==========================================
    const heroTl = gsap.timeline();
    
    // Background parallax & scale
    heroTl.fromTo(".hero-bg", 
        { scale: 1.2, opacity: 0 },
        { scale: 1.1, opacity: 1, duration: 2, ease: "power3.out" }
    );

    // Text Reveal
    heroTl.fromTo(".reveal-up",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" },
        "-=1.5"
    );

    // Floating cards entrance
    heroTl.fromTo(".glass-card",
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" },
        "-=1"
    );

    // ==========================================
    // 5. Hero Parallax on Scroll (Responsive)
    // ==========================================
    let mm = gsap.matchMedia();

    mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.to(".hero-bg", {
            yPercent: 30,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });

        // Floating cards parallax
        document.querySelectorAll('.glass-card').forEach(card => {
            const speed = card.getAttribute('data-speed');
            gsap.to(card, {
                y: -100 * speed,
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        });
    });


    // ==========================================
    // 6. Portfolio (Vertical Grid now)
    // ==========================================
    // Horizontal scroll removed as per user request

    // ==========================================
    // 7. Process Timeline Animation
    // ==========================================
    const progressLine = document.querySelector('.progress-line');
    if (progressLine) {
        gsap.to(progressLine, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
                trigger: ".timeline-container",
                start: "top center",
                end: "bottom center",
                scrub: 1
            }
        });
    }

    // Step circle highlight
    const steps = document.querySelectorAll('.timeline-step');
    steps.forEach(step => {
        ScrollTrigger.create({
            trigger: step,
            start: "top center",
            toggleClass: "active"
        });
    });

    // ==========================================
    // 8. Navbar Shrink on Scroll
    // ==========================================
    const nav = document.querySelector('.nav-glass');
    ScrollTrigger.create({
        start: "top -50",
        end: 99999,
        toggleClass: {className: 'scrolled', targets: nav},
        onUpdate: (self) => {
            // Only shrink if on desktop
            if (window.innerWidth > 768) {
                if(self.direction === 1) {
                    gsap.to(nav, { width: '85%', padding: '0.8rem 2rem', duration: 0.3 });
                } else if (self.direction === -1 && self.progress < 0.05) {
                    gsap.to(nav, { width: '95%', padding: '1.2rem 2rem', duration: 0.3 });
                }
            }
        }
    });

    // ==========================================
    // 9. Mobile Hamburger Menu Logic
    // ==========================================
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-btn');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
});
