/**
 * Portfolio JavaScript Interactions
 * Owner: Narisetty Ravi Sankar Balaji
 * Title: B.Tech Information Technology Student
 * Institution: Vignan University
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. DYNAMIC TYPING TEXT EFFECT (HERO SECTION)
       ========================================================================== */
    const typingElement = document.getElementById('typingText');
    const roles = [
        'Future Software Engineer.',
        'Tech Enthusiast.',
        'Creative Problem Solver.',
        '2nd Year IT Student.',
        'Passionate Programmer.'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeEffect() {
        if (!typingElement) return;

        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            // Pause at end of word
            typingSpeed = 1800;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 400;
        }

        setTimeout(typeEffect, typingSpeed);
    }

    typeEffect();


    /* ==========================================================================
       2. STICKY NAVBAR & ACTIVE LINK HIGHLIGHT (SCROLL SPY)
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    function handleScrollState() {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active section detection
        const scrollPosition = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', handleScrollState, { passive: true });
    handleScrollState();


    /* ==========================================================================
       3. MOBILE HAMBURGER MENU & DRAWER TOGGLE
       ========================================================================== */
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    if (hamburgerBtn && mobileDrawer) {
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = mobileDrawer.classList.toggle('open');
            hamburgerBtn.classList.toggle('active');
            hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close drawer when any mobile link is clicked
        drawerLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.remove('open');
                hamburgerBtn.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            });
        });

        // Close drawer on click outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && !mobileDrawer.contains(e.target)) {
                mobileDrawer.classList.remove('open');
                hamburgerBtn.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }


    /* ==========================================================================
       4. EMAIL COPY ACTION WITH TOAST NOTIFICATION
       ========================================================================== */
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    const copyBtnText = document.getElementById('copyBtnText');

    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            const email = copyEmailBtn.getAttribute('data-email') || 'narisettyravisankarbalaji@gmail.com';

            navigator.clipboard.writeText(email).then(() => {
                showToast('Email address copied to clipboard!');
                
                // Temporary button text feedback
                if (copyBtnText) {
                    const originalText = copyBtnText.textContent;
                    copyBtnText.textContent = 'Copied to Clipboard!';
                    setTimeout(() => {
                        copyBtnText.textContent = originalText;
                    }, 2500);
                }
            }).catch(() => {
                // Fallback prompt
                window.prompt('Copy email address:', email);
            });
        });
    }

    function showToast(message) {
        if (!toast) return;
        if (toastMessage) toastMessage.textContent = message;
        
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }


    /* ==========================================================================
       5. BACK TO TOP FLOATING BUTTON
       ========================================================================== */
    const backToTopBtn = document.getElementById('backToTopBtn');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 350) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }


    /* ==========================================================================
       6. PROFILE IMAGE ERROR HANDLING / FALLBACK
       ========================================================================== */
    const profileImgs = document.querySelectorAll('.hero-profile-img, .about-photo');
    profileImgs.forEach(img => {
        img.addEventListener('error', function() {
            // Elegant fallback SVG avatar if image fails to load
            this.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect width='400' height='400' fill='%230f172a'/><circle cx='200' cy='160' r='70' fill='%2338bdf8' opacity='0.85'/><path d='M100 340 C100 250, 300 250, 300 340 Z' fill='%236366f1' opacity='0.85'/><text x='50%' y='92%' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='sans-serif' font-weight='bold' font-size='16'>Narisetty Ravi Sankar Balaji</text></svg>";
        });
    });

});

/* ==========================================================================
   7. INTERACTIVE CONTACT FORM SUBMIT HANDLER
   ========================================================================== */
function handleFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('senderName')?.value.trim();
    const email = document.getElementById('senderEmail')?.value.trim();
    const subject = document.getElementById('senderSubject')?.value.trim();
    const message = document.getElementById('senderMessage')?.value.trim();

    if (!name || !email || !message) {
        alert('Please fill in all required fields.');
        return;
    }

    // Format mailto link
    const mailtoRecipient = 'narisettyravisankarbalaji@gmail.com';
    const emailSubject = encodeURIComponent(`[Portfolio Inquiry] ${subject || 'Collaboration'}`);
    const emailBody = encodeURIComponent(`Hello Balaji,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent from Portfolio Website`);

    // Open default email client with prefilled draft
    window.location.href = `mailto:${mailtoRecipient}?subject=${emailSubject}&body=${emailBody}`;

    const form = document.getElementById('contactForm');
    if (form) {
        const submitBtn = document.getElementById('submitMessageBtn');
        if (submitBtn) {
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Draft Opened in Email App!</span>';
            setTimeout(() => {
                submitBtn.innerHTML = originalHTML;
            }, 4000);
        }
    }
}
