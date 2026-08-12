// ============================================================
//  Aaryn & Braden — Wedding Site
// ============================================================

const prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Utility ----
function esc(str) {
    const d = document.createElement('div');
    d.textContent = str == null ? '' : str;
    return d.innerHTML;
}

// ============================================================
//  NAV — scroll state, smooth scroll, mobile menu
// ============================================================
const navbar = document.getElementById('navbar');
const mobileMenu = document.getElementById('mobile-menu');
const burger = document.querySelector('.nav-burger');

function applyNavState() {
    if (window.scrollY > 80) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
}

function openMobileMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
}
function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
}

burger.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) closeMobileMenu();
    else openMobileMenu();
});
document.querySelector('.mobile-menu-close').addEventListener('click', closeMobileMenu);

// Smooth scroll for in-page anchors (and close mobile menu)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const id = this.getAttribute('href').slice(1);
        const target = id ? document.getElementById(id) : null;
        if (!target) return;
        e.preventDefault();
        closeMobileMenu();
        const y = target.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
});

// ============================================================
//  PARALLAX (hero + interlude) — rAF-throttled
// ============================================================
const heroBg = document.getElementById('hero-bg');
const interludeBg = document.getElementById('interlude-bg');
let ticking = false;

function onScroll() {
    applyNavState();
    if (prefersReduced) return;
    const y = window.scrollY || window.pageYOffset;
    if (heroBg) heroBg.style.transform = 'translateY(' + (y * 0.22) + 'px)';
    if (interludeBg) {
        const r = interludeBg.getBoundingClientRect();
        const off = (r.top + r.height / 2 - window.innerHeight / 2) * -0.08;
        interludeBg.style.transform = 'translateY(' + off + 'px)';
    }
}

window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => { onScroll(); ticking = false; });
}, { passive: true });
onScroll();

// ============================================================
//  SCROLL REVEALS
// ============================================================
(function () {
    const els = Array.from(document.querySelectorAll('.reveal'));
    if (prefersReduced || !('IntersectionObserver' in window)) {
        els.forEach(el => el.classList.add('in'));
        return;
    }
    // Stagger reveals within the same section
    const seen = new Map();
    els.forEach(el => {
        const sec = el.closest('section, footer') || el;
        const n = seen.get(sec) || 0;
        seen.set(sec, n + 1);
        el.style.transitionDelay = Math.min(n * 0.09, 0.27) + 's';
    });
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
})();

// ============================================================
//  COUNTDOWN
// ============================================================
(function () {
    const target = new Date('2026-11-07T16:00:00-05:00').getTime();
    const grid = document.getElementById('countdown-grid');
    const past = document.getElementById('countdown-past');
    const cells = {
        days: document.querySelector('[data-cd="days"]'),
        hours: document.querySelector('[data-cd="hours"]'),
        minutes: document.querySelector('[data-cd="minutes"]'),
        seconds: document.querySelector('[data-cd="seconds"]'),
    };
    const pad = (n) => String(n).padStart(2, '0');

    function tick() {
        const diff = target - Date.now();
        if (diff <= 0) {
            if (grid) grid.hidden = true;
            if (past) past.hidden = false;
            return false;
        }
        cells.days.textContent = String(Math.floor(diff / 86400000));
        cells.hours.textContent = pad(Math.floor(diff / 3600000) % 24);
        cells.minutes.textContent = pad(Math.floor(diff / 60000) % 60);
        cells.seconds.textContent = pad(Math.floor(diff / 1000) % 60);
        return true;
    }

    if (tick()) {
        const timer = setInterval(() => { if (!tick()) clearInterval(timer); }, 1000);
    }
})();

// ============================================================
//  FAQ ACCORDION
// ============================================================
(function () {
    const faqs = [
        { q: 'Where exactly is the wedding?', a: 'The Barn on New River, 2162 S Fork Farm Ln, West Jefferson, NC 28694. It is a rustic barn venue in the Blue Ridge mountains, right on the New River, with both the ceremony and reception on-site.' },
        { q: 'What time should I arrive?', a: 'The ceremony begins at 4:00 pm. Please plan to arrive by 3:45 pm so you can park, find a seat, and settle in before we begin.' },
        { q: 'What should I wear?', a: 'Semi-formal attire. Think cocktail dresses, dressy separates, suits, or a shirt and slacks. It is an outdoor-and-barn setting in the mountains in November, so bring a warm layer, and consider block heels rather than stilettos for grass and gravel.' },
        { q: 'Will it be indoors or outdoors?', a: 'The ceremony is planned outdoors, with the reception to follow inside the barn. We will keep an eye on the mountain forecast and have a comfortable backup plan if the weather turns.' },
        { q: 'Where should we stay?', a: 'We have rooms set aside at the Hampton Inn & Suites in Boone for the wedding weekend. See the Travel & Stay section above for the booking link, along with a few of the places we love around Boone and West Jefferson.' },
        { q: 'Can I bring a guest or my kids?', a: 'Your invitation and RSVP will show exactly who is included in your party, and we kindly ask that only those named are able to attend. If you see a "Guest" spot when you look up your name, you are welcome to bring a plus-one; just add their name when you RSVP. As much as we adore your little ones, we have planned an adults-only celebration, so please enjoy the evening as a night off.' },
        { q: 'How do I RSVP?', a: 'Click any RSVP button, search your name to pull up your party, and respond for each guest. Please reply as soon as you are able so we can finalize our headcount.' },
    ];
    const list = document.getElementById('faq-list');
    if (!list) return;
    list.innerHTML = faqs.map((f, i) => `
        <div class="faq-item" data-faq="${i}">
            <button class="faq-q" aria-expanded="false">
                <span>${esc(f.q)}</span>
                <span class="faq-icon">+</span>
            </button>
            <p class="faq-a">${esc(f.a)}</p>
        </div>
    `).join('');

    list.querySelectorAll('.faq-item').forEach(item => {
        const btn = item.querySelector('.faq-q');
        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            list.querySelectorAll('.faq-item.open').forEach(o => {
                o.classList.remove('open');
                o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                item.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });
})();

// ============================================================
//  RSVP MODAL
// ============================================================
const modal = document.getElementById('rsvp-modal');
const modalCard = modal.querySelector('.modal-card');

let currentParty = null;   // { partyName, guests: [{id, name}] }
let partyResults = [];     // last lookup results
let lookupTimer = null;

// ---- Open / close ----
document.querySelectorAll('[data-open-rsvp]').forEach(btn => {
    btn.addEventListener('click', openModal);
});
modal.querySelector('.modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

function openModal() {
    resetModal();
    closeMobileMenu();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('lookup-name').focus(), 50);
}
function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}
function resetModal() {
    showStep(1);
    currentParty = null;
    partyResults = [];
    document.getElementById('lookup-name').value = '';
    document.getElementById('lookup-results').innerHTML = '';
    document.getElementById('guest-cards').innerHTML = '';
    document.getElementById('rsvp-email').value = '';
    document.getElementById('rsvp-message').value = '';
    clearFormMessage();
}
function showStep(n) {
    [1, 2, 3].forEach(i => {
        document.getElementById(`rsvp-step-${i}`).hidden = i !== n;
    });
    if (modalCard) modalCard.scrollIntoView({ block: 'nearest' });
}
function clearFormMessage() {
    const el = document.getElementById('rsvp-form-message');
    el.className = 'form-message';
    el.hidden = true;
    el.textContent = '';
}
function showFormError(msg) {
    const el = document.getElementById('rsvp-form-message');
    el.className = 'form-message error';
    el.hidden = false;
    el.textContent = msg;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ---- Step 1: name lookup ----
const lookupInput = document.getElementById('lookup-name');
const lookupResults = document.getElementById('lookup-results');

lookupInput.addEventListener('input', () => {
    clearTimeout(lookupTimer);
    const val = lookupInput.value.trim();
    if (val.length < 2) { lookupResults.innerHTML = ''; return; }
    lookupResults.innerHTML = '<p class="lookup-searching">Searching&hellip;</p>';
    lookupTimer = setTimeout(() => doLookup(val), 320);
});

async function doLookup(name) {
    try {
        const res = await fetch(`/api/rsvp?name=${encodeURIComponent(name)}`);
        const data = await res.json();
        if (!data || !data.success) {
            lookupResults.innerHTML = '<p class="lookup-no-results">Search failed. Please try again.</p>';
            return;
        }
        partyResults = data.parties || [];
        if (partyResults.length === 0) {
            lookupResults.innerHTML = `
                <div class="lookup-no-results">
                    <p>We couldn't find an invitation under "<strong>${esc(name)}</strong>".</p>
                    <p>Try a different spelling, or reach out to us directly.</p>
                </div>`;
            return;
        }
        lookupResults.innerHTML = `<div class="party-list">${partyResults.map((party, idx) => `
            <button class="party-card" data-idx="${idx}">
                <div class="party-card-name">${esc(party.partyName)}</div>
                <div class="party-card-guests">
                    ${party.guests.map(g => `<span class="party-guest-chip">${esc(g.name)}</span>`).join('')}
                </div>
            </button>`).join('')}</div>`;

        lookupResults.querySelectorAll('.party-card').forEach(card => {
            card.addEventListener('click', () => selectParty(partyResults[parseInt(card.dataset.idx, 10)]));
        });
    } catch {
        lookupResults.innerHTML = '<p class="lookup-no-results">Search failed. Please try again.</p>';
    }
}

// Returns true for placeholder slots like "Satchel Moberg's Guest"
function isGuestSlot(name) {
    return /guest$/i.test((name || '').trim());
}

// ---- Step 2: build guest cards ----
function selectParty(party) {
    if (!party) return;
    currentParty = party;
    document.getElementById('party-name-heading').textContent = party.partyName;

    document.getElementById('guest-cards').innerHTML = party.guests.map((guest, idx) => `
        <div class="guest-card" data-idx="${idx}">
            <div class="guest-card-head">
                <span class="guest-card-name">${esc(guest.name)}</span>
                <div class="attend-toggle">
                    <button type="button" class="attend-btn accept active" data-idx="${idx}" data-val="true">Accept</button>
                    <button type="button" class="attend-btn decline" data-idx="${idx}" data-val="false">Decline</button>
                </div>
            </div>
            ${isGuestSlot(guest.name) ? `
            <div class="guest-field">
                <label class="field-label">Guest Name</label>
                <input type="text" class="field-input guest-name-input" placeholder="Enter guest's name" data-idx="${idx}">
            </div>` : ''}
            <div class="guest-field">
                <label class="field-label">Dietary Restrictions</label>
                <input type="text" class="field-input dietary-input" placeholder="None" data-idx="${idx}">
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.attend-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = btn.dataset.idx;
            document.querySelectorAll(`.attend-btn[data-idx="${idx}"]`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    clearFormMessage();
    showStep(2);
}

document.getElementById('rsvp-back-btn').addEventListener('click', () => {
    clearFormMessage();
    showStep(1);
});

// ---- Step 3: submit ----
document.getElementById('rsvp-submit-btn').addEventListener('click', async () => {
    clearFormMessage();
    if (!currentParty) return;

    const email = document.getElementById('rsvp-email').value.trim();
    const message = document.getElementById('rsvp-message').value.trim();
    if (!email) { showFormError('Please enter your email address.'); return; }

    const guests = Array.from(document.querySelectorAll('.guest-card')).map(card => {
        const idx = parseInt(card.dataset.idx, 10);
        const activeBtn = card.querySelector('.attend-btn.active');
        const dietary = card.querySelector('.dietary-input').value.trim();
        const nameInput = card.querySelector('.guest-name-input');
        const resolvedName = nameInput && nameInput.value.trim()
            ? nameInput.value.trim()
            : currentParty.guests[idx].name;
        return {
            name: resolvedName,
            attending: activeBtn ? activeBtn.dataset.val === 'true' : true,
            dietary,
            inviteListId: currentParty.guests[idx].id,
        };
    });

    const submitBtn = document.getElementById('rsvp-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
        const res = await fetch('/api/rsvp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ partyName: currentParty.partyName, email, message, guests }),
        });
        const data = await res.json();
        if (data && data.success) {
            document.getElementById('rsvp-confirmation-msg').textContent =
                data.message || "Thank you! We can't wait to celebrate with you!";
            showStep(3);
            setTimeout(closeModal, 6000);
        } else {
            showFormError((data && data.message) || 'An error occurred. Please try again.');
        }
    } catch {
        showFormError('An error occurred. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit RSVP';
    }
});

console.log('Wedding website loaded successfully!');
