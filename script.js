// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.getElementById('navbar').offsetHeight;
            window.scrollTo({ top: target.offsetTop - navHeight, behavior: 'smooth' });
        }
    });
});

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', function () {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// ===== MOBILE MENU =====
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
mobileMenuToggle.addEventListener('click', function () {
    navMenu.classList.toggle('active');
});

const mobileMenuStyle = document.createElement('style');
mobileMenuStyle.textContent = `
    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            padding: 2rem;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
    }
`;
document.head.appendChild(mobileMenuStyle);

// ===== INTERSECTION OBSERVER (fade-in) =====
const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

const heroSection = document.querySelector('.hero');
if (heroSection) {
    heroSection.style.opacity = '1';
    heroSection.style.transform = 'translateY(0)';
}

// ===== RSVP MODAL =====

const modal      = document.getElementById('rsvp-modal');
const openBtn    = document.getElementById('open-rsvp-btn');
const closeBtn   = document.querySelector('.close');

// State
let currentParty   = null;   // { partyName, guests: [{id, name, isPrimary}] }
let partyResults   = [];     // array of party objects from last lookup
let lookupTimer    = null;

// ---- Open / Close ----

openBtn.addEventListener('click', () => {
    resetModal();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    document.getElementById('lookup-name').focus();
});

closeBtn.addEventListener('click', closeModal);

window.addEventListener('click', e => {
    if (e.target === modal) closeModal();
});

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
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
        document.getElementById(`rsvp-step-${i}`).style.display = i === n ? 'block' : 'none';
    });
    // Scroll modal content to top on step change
    const mc = document.querySelector('.modal-content');
    if (mc) mc.scrollTop = 0;
}

function clearFormMessage() {
    const el = document.getElementById('rsvp-form-message');
    el.className = 'form-message';
    el.textContent = '';
}

// ---- Step 1: Name lookup ----

const lookupInput   = document.getElementById('lookup-name');
const lookupResults = document.getElementById('lookup-results');

lookupInput.addEventListener('input', () => {
    clearTimeout(lookupTimer);
    const val = lookupInput.value.trim();
    if (val.length < 2) {
        lookupResults.innerHTML = '';
        return;
    }
    lookupResults.innerHTML = '<p class="lookup-searching">Searching&hellip;</p>';
    lookupTimer = setTimeout(() => doLookup(val), 300);
});

async function doLookup(name) {
    try {
        const res  = await fetch(`/api/rsvp?name=${encodeURIComponent(name)}`);
        const data = await res.json();

        if (!data.success) {
            lookupResults.innerHTML = `<p class="lookup-no-results">Search failed. Please try again.</p>`;
            return;
        }

        partyResults = data.parties;

        if (partyResults.length === 0) {
            lookupResults.innerHTML = `
                <div class="lookup-no-results">
                    <p>No invitation found for "<strong>${esc(name)}</strong>".</p>
                    <p>Please contact us directly if you believe this is an error.</p>
                </div>`;
            return;
        }

        lookupResults.innerHTML = partyResults.map((party, idx) => `
            <div class="party-card" data-idx="${idx}">
                <div class="party-card-name">${esc(party.partyName)}</div>
                <div class="party-card-guests">
                    ${party.guests.map(g => `<span class="party-guest-chip">${esc(g.name)}</span>`).join('')}
                </div>
            </div>
        `).join('');

        lookupResults.querySelectorAll('.party-card').forEach(card => {
            card.addEventListener('click', () => {
                selectParty(partyResults[parseInt(card.dataset.idx)]);
            });
        });

    } catch {
        lookupResults.innerHTML = '<p class="lookup-no-results">Search failed. Please try again.</p>';
    }
}

// ---- Step 2: Party selected — build guest cards ----

function selectParty(party) {
    currentParty = party;
    document.getElementById('party-name-heading').textContent = party.partyName;

    document.getElementById('guest-cards').innerHTML = party.guests.map((guest, idx) => `
        <div class="guest-card" data-idx="${idx}">
            <span class="guest-card-name">${esc(guest.name)}</span>
            <div class="attend-toggle">
                <button type="button" class="attend-btn accept active" data-idx="${idx}" data-val="true">Joyfully Accept</button>
                <button type="button" class="attend-btn decline"       data-idx="${idx}" data-val="false">Regretfully Decline</button>
            </div>
            <div class="form-group dietary-group">
                <label>Dietary Restrictions</label>
                <input type="text" class="dietary-input" placeholder="None" data-idx="${idx}">
            </div>
        </div>
    `).join('');

    // Wire up toggle buttons
    document.querySelectorAll('.attend-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = btn.dataset.idx;
            document.querySelectorAll(`.attend-btn[data-idx="${idx}"]`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    showStep(2);
}

// Back button
document.getElementById('rsvp-back-btn').addEventListener('click', () => {
    showStep(1);
});

// ---- Step 3: Submit ----

document.getElementById('rsvp-submit-btn').addEventListener('click', async () => {
    clearFormMessage();

    if (!currentParty) return;

    const email   = document.getElementById('rsvp-email').value.trim();
    const message = document.getElementById('rsvp-message').value.trim();

    if (!email) {
        showFormError('Please enter your email address.');
        return;
    }

    const guests = Array.from(document.querySelectorAll('.guest-card')).map(card => {
        const idx       = parseInt(card.dataset.idx);
        const activeBtn = card.querySelector('.attend-btn.active');
        const dietary   = card.querySelector('.dietary-input').value.trim();
        return {
            name:         currentParty.guests[idx].name,
            attending:    activeBtn ? activeBtn.dataset.val === 'true' : true,
            dietary,
            inviteListId: currentParty.guests[idx].id,
        };
    });

    const submitBtn = document.getElementById('rsvp-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting\u2026';

    try {
        const res  = await fetch('/api/rsvp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ partyName: currentParty.partyName, email, message, guests }),
        });
        const data = await res.json();

        if (data.success) {
            document.getElementById('rsvp-confirmation-msg').textContent = data.message;
            showStep(3);
            setTimeout(closeModal, 6000);
        } else {
            showFormError(data.message || 'An error occurred. Please try again.');
        }
    } catch {
        showFormError('An error occurred. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit RSVP';
    }
});

function showFormError(msg) {
    const el = document.getElementById('rsvp-form-message');
    el.className = 'form-message error';
    el.textContent = msg;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ---- Utility ----

function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

console.log('Wedding website loaded successfully!');
