// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// IBHRE Modal Functionality
const ibhreModal = document.getElementById('ibhreModal');
const ibhrePopupBtn = document.getElementById('ibhrePopupBtn');
const closeIbhreModal = document.getElementById('closeIbhreModal');
const ibhreForm = document.getElementById('ibhreForm');

// Open modal
if (ibhrePopupBtn) {
    ibhrePopupBtn.addEventListener('click', () => {
        ibhreModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

// Close modal
if (closeIbhreModal) {
    closeIbhreModal.addEventListener('click', () => {
        ibhreModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}

// Close modal when clicking outside
if (ibhreModal) {
    ibhreModal.addEventListener('click', (e) => {
        if (e.target === ibhreModal) {
            ibhreModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Handle IBHRE form submission
if (ibhreForm) {
    ibhreForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(ibhreForm);
        const data = Object.fromEntries(formData);

        console.log('IBHRE Enrollment Data:', data);

        // Show success message
        alert('Thank you for your interest! We will contact you shortly with enrollment details.');

        // Close modal
        ibhreModal.classList.remove('active');
        document.body.style.overflow = 'auto';

        // Reset form
        ibhreForm.reset();

        // In production, send this data to your backend/LMS
        // Example: fetch('/api/ibhre-enrollment', { method: 'POST', body: formData })
    });
}

// Contact Form - now uses Formsubmit.co (standard form submission)
// No JavaScript needed - form submits directly to email

// Scroll Animation for cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe product cards and resource cards
document.querySelectorAll('.product-card, .resource-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Active Navigation Highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.style.fontWeight = '500';
            });
            if (navLink) {
                navLink.style.fontWeight = '700';
            }
        }
    });
});

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ibhreModal && ibhreModal.classList.contains('active')) {
        ibhreModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Auto-popup IBHRE modal after 30 seconds (optional - can be disabled)
// Uncomment the following code if you want the popup to show automatically
/*
setTimeout(() => {
    if (ibhreModal && !sessionStorage.getItem('ibhrePopupShown')) {
        ibhreModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        sessionStorage.setItem('ibhrePopupShown', 'true');
    }
}, 30000);
*/

// Resource Email Capture Modal
let currentResource = null;

const resourceModal = document.getElementById('resourceModal');
const resourceForm = document.getElementById('resourceForm');
const resourceNameInput = document.getElementById('resourceName');
const resourceEmailInput = document.getElementById('resourceEmail');
const modalTitle = document.getElementById('modalTitle');
const otherRoleInput = document.getElementById('otherRole');
const roleCheckboxes = document.querySelectorAll('input[name="role"]');

const resourceInfo = {
    'cardiac-quiz': {
        title: 'Cardiac Device Quiz',
        url: 'quiz.html'
    },
    'ccds-quiz': {
        title: 'IBHRE CCDS Quiz',
        url: 'ccds-quiz.html'
    },
    'ibhre-guide': {
        title: 'Free IBHRE CCDS Study Guide',
        url: 'IBHRE guide.pdf',
        isExternal: true
    }
};

function openResourceModal(resourceId) {
    currentResource = resourceId;
    const resource = resourceInfo[resourceId];
    if (resource) {
        modalTitle.textContent = `Access: ${resource.title}`;
        resourceModal.classList.add('active');
    }
}

function closeResourceModal() {
    resourceModal.classList.remove('active');
    resourceForm.reset();
    otherRoleInput.style.display = 'none';
    currentResource = null;
}

// Handle "Other" checkbox to show/hide text input
roleCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        const otherCheckbox = document.querySelector('input[name="role"][value="Other"]');
        if (otherCheckbox && otherCheckbox.checked) {
            otherRoleInput.style.display = 'block';
            otherRoleInput.focus();
        } else {
            otherRoleInput.style.display = 'none';
            otherRoleInput.value = '';
        }
    });
});

// Close modal when clicking outside
resourceModal.addEventListener('click', (e) => {
    if (e.target === resourceModal) {
        closeResourceModal();
    }
});

// Handle form submission - set hidden fields before form submits to Formsubmit.co
resourceForm.addEventListener('submit', (e) => {
    if (!currentResource) {
        e.preventDefault();
        return;
    }

    const resource = resourceInfo[currentResource];

    // Set hidden field values
    document.getElementById('resourceType').value = resource.title;
    document.getElementById('resourceSubject').value = `New Signup: ${resource.title}`;

    // Set redirect to resource after form submission
    if (resource.isExternal) {
        document.getElementById('resourceRedirect').value = resource.url;
    } else {
        document.getElementById('resourceRedirect').value = window.location.origin + '/' + resource.url;
    }

    // Form will submit naturally to Formsubmit.co
});

console.log('Mr Pacemaker website loaded successfully!');

// ==========================================
// ECG Canvas Animation - Exact NSR from ECG Vault
// ==========================================
(function() {
    const canvas = document.getElementById('ecgCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // ECG parameters matching ECG Vault exactly
    const pixelsPerMm = 4; // Scale factor
    const speed = 25; // 25 mm/sec
    const bpm = 72; // Normal sinus rhythm at 72 bpm
    const rrInterval = pixelsPerMm * (60 / bpm) * speed; // RR interval in pixels

    const baselineY = height * 0.55; // Baseline slightly below center
    const amplitudeScale = height * 0.35; // Amplitude scaling

    // Waveform dimensions (matching ECG Vault)
    const pWidth = pixelsPerMm * 2.5;      // P wave ~100ms
    const prInterval = pixelsPerMm * 4;    // PR interval ~160ms
    const qrsWidth = pixelsPerMm * 2.5;    // QRS ~100ms
    const tWidth = pixelsPerMm * 4;        // T wave width
    const stSegment = pixelsPerMm * 2;     // ST segment

    // Amplitudes (matching ECG Vault)
    const pHeight = amplitudeScale * 0.15;
    const qDepth = amplitudeScale * 0.1;
    const rHeight = amplitudeScale * 1.0;
    const sDepth = amplitudeScale * 0.2;
    const tHeight = amplitudeScale * 0.18;

    let offset = 0;
    const scrollSpeed = pixelsPerMm * speed / 60; // Pixels per frame at 60fps

    function drawBeat(startX) {
        // P wave start position
        const pStartX = startX + pixelsPerMm * 0.5;
        const pEndX = pStartX + pWidth;

        // QRS positions
        const qrsStartX = pStartX + prInterval;
        const qrsEndX = qrsStartX + qrsWidth;

        // T wave positions
        const stEndX = qrsEndX + stSegment;
        const tEndX = stEndX + tWidth;

        // Draw baseline to P wave start
        ctx.lineTo(pStartX, baselineY);

        // P wave - slightly peaked symmetric curve (matching ECG Vault)
        for (let t = 0; t <= 1; t += 0.1) {
            const x = pStartX + t * pWidth;
            const y = baselineY - pHeight * Math.pow(Math.sin(t * Math.PI), 1.3);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(pEndX, baselineY);

        // PR segment (flat)
        ctx.lineTo(qrsStartX, baselineY);

        // QRS complex
        // Q wave (small downward)
        const qWidth = qrsWidth * 0.15;
        ctx.lineTo(qrsStartX + qWidth * 0.5, baselineY + qDepth);

        // R wave (tall upward spike)
        const rPeakX = qrsStartX + qrsWidth * 0.35;
        ctx.lineTo(rPeakX, baselineY - rHeight);

        // S wave (downward)
        const sX = qrsStartX + qrsWidth * 0.55;
        ctx.lineTo(sX, baselineY + sDepth);

        // Return to baseline (J point)
        ctx.lineTo(qrsEndX, baselineY);

        // ST segment (flat)
        ctx.lineTo(stEndX, baselineY);

        // T wave - symmetrical rounded curve (matching ECG Vault)
        for (let t = 0; t <= 1; t += 0.05) {
            const x = stEndX + t * tWidth;
            const y = baselineY - tHeight * Math.sin(t * Math.PI);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(tEndX, baselineY);

        // Baseline to next beat
        ctx.lineTo(startX + rrInterval, baselineY);

        return startX + rrInterval;
    }

    function draw() {
        // Clear canvas with dark background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Draw grid (subtle)
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.15)';
        ctx.lineWidth = 0.5;

        // Small squares (1mm)
        for (let x = 0; x < width; x += pixelsPerMm) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += pixelsPerMm) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Large squares (5mm)
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < width; x += pixelsPerMm * 5) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += pixelsPerMm * 5) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw ECG trace
        ctx.beginPath();
        ctx.strokeStyle = '#10b981'; // Emerald green
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Calculate starting beat
        const startBeat = Math.floor(offset / rrInterval) - 1;
        const numBeats = Math.ceil(width / rrInterval) + 3;

        // Start position
        let x = startBeat * rrInterval - offset;
        ctx.moveTo(x, baselineY);

        // Draw multiple beats
        for (let i = 0; i < numBeats; i++) {
            x = drawBeat(x);
        }

        ctx.stroke();

        // Update offset for scrolling
        offset += scrollSpeed;

        requestAnimationFrame(draw);
    }

    // Start animation
    draw();
})();
