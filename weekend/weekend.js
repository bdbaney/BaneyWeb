/* ============================================================
   Wedding party weekend page.
   Renders from the static fallback (schedule.js) or the last good
   copy cached on this phone, then refreshes from /api/schedule.
   Add ?now=2026-11-07T17:40 to the URL to preview a moment in time.
   ============================================================ */
(function () {
    'use strict';

    var TZ = 'America/New_York';
    var CACHE_KEY = 'wk-schedule-v1';
    var DAYS = [
        { date: '2026-11-06', label: 'Friday, November 6', title: 'Rehearsal + Welcome Party' },
        { date: '2026-11-07', label: 'Saturday, November 7', title: 'Wedding Day', wedding: true },
        { date: '2026-11-08', label: 'Sunday, November 8', title: 'Farewell at Booneshine' }
    ];

    var data = loadCached() || window.WEEKEND_FALLBACK;
    var source = loadCached() ? 'saved copy' : 'built-in copy';
    var selectedDay = null;
    var sideFilter = 'all';
    var confettiDone = false;

    // ---------- time helpers ----------
    var override = (function () {
        var m = location.search.match(/[?&]now=([^&]+)/);
        if (!m) return null;
        var s = decodeURIComponent(m[1]);
        if (!/[zZ]|[+-]\d\d:?\d\d$/.test(s)) s += '-05:00'; // treat as Eastern
        var d = new Date(s);
        return isNaN(d) ? null : d;
    })();
    function now() { return override || new Date(); }

    var timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });
    var dateFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
    function fmtTime(iso) { return timeFmt.format(new Date(iso)); }
    function etDate(d) { return dateFmt.format(d); } // YYYY-MM-DD

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // ---------- data helpers ----------
    function sortedItems() {
        return data.timeline_items.slice().sort(function (a, b) {
            return new Date(a.start_time) - new Date(b.start_time) || (a.sort_order || 0) - (b.sort_order || 0);
        });
    }
    function eventsFor(day) {
        return data.events.filter(function (e) { return e.day === day; })
            .sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
    }
    function eventById(id) {
        for (var i = 0; i < data.events.length; i++) if (data.events[i].id === id) return data.events[i];
        return null;
    }
    function itemsFor(day) {
        var ids = eventsFor(day).map(function (e) { return e.id; });
        return sortedItems().filter(function (it) { return ids.indexOf(it.event_id) !== -1; });
    }

    // An item is "on" from its start until its end, or until the next item
    // starts (capped at 90 minutes when there's no end time).
    function itemWindow(list, i) {
        var it = list[i];
        var start = new Date(it.start_time);
        var end;
        if (it.end_time) end = new Date(it.end_time);
        else {
            var next = list[i + 1] ? new Date(list[i + 1].start_time) : null;
            var cap = new Date(start.getTime() + 90 * 60000);
            end = next && next < cap ? next : cap;
        }
        return { start: start, end: end };
    }

    function nowAndNext() {
        var list = sortedItems();
        var t = now();
        var current = [];
        var next = null;
        for (var i = 0; i < list.length; i++) {
            var w = itemWindow(list, i);
            if (w.start <= t && t < w.end) current.push({ item: list[i], end: w.end });
            if (!next && w.start > t) next = list[i];
        }
        return { current: current, next: next, list: list };
    }

    // ---------- rendering ----------
    function mapLinks(address) {
        var q = encodeURIComponent(address);
        return '<div class="wk-map-links">' +
            '<a class="wk-btn" href="https://www.google.com/maps/dir/?api=1&destination=' + q + '" target="_blank" rel="noopener">Google Maps</a>' +
            '<a class="wk-btn wk-btn-ghost" href="https://maps.apple.com/?daddr=' + q + '" target="_blank" rel="noopener">Apple Maps</a>' +
            '</div>';
    }

    function renderLocation(ev) {
        return '<article class="wk-place">' +
            '<p class="wk-place-kicker">' + esc(ev.title) + '</p>' +
            '<h3>' + esc(ev.location_name) + '</h3>' +
            (ev.address ? '<p class="wk-place-addr">' + esc(ev.address) + '</p>' : '') +
            (ev.notes ? '<p class="wk-place-note">' + esc(ev.notes) + '</p>' : '') +
            (ev.address ? mapLinks(ev.address) : '') +
            '</article>';
    }

    function renderItem(it, state) {
        var cls = 'wk-item';
        if (it.highlight) cls += ' is-key';
        if (it.kind === 'sunset') cls += ' is-sunset';
        if (state.currentIds.indexOf(it) !== -1) cls += ' is-now';
        else if (state.next === it) cls += ' is-next';
        else if (new Date(it.start_time) < now() && state.past.indexOf(it) !== -1) cls += ' is-past';

        var side = it.side || 'all';
        return '<li class="' + cls + '" data-side="' + esc(side) + '">' +
            '<div class="wk-time"><strong>' + esc(fmtTime(it.start_time)) + '</strong>' +
            (it.end_time ? '<small>until ' + esc(fmtTime(it.end_time)) + '</small>' : '') + '</div>' +
            '<div class="wk-what">' +
            (state.currentIds.indexOf(it) !== -1 ? '<span class="wk-flag">Now</span>' : '') +
            (state.next === it ? '<span class="wk-flag wk-flag-next">Up next</span>' : '') +
            '<h4>' + esc(it.title) + '</h4>' +
            (it.details ? '<p>' + esc(it.details) + '</p>' : '') +
            (it.audience ? '<span class="wk-who wk-who-' + esc(side) + '">' + esc(it.audience) + '</span>' : '') +
            '</div></li>';
    }

    function renderDay(dayDate) {
        var day = DAYS.filter(function (d) { return d.date === dayDate; })[0];
        var events = eventsFor(dayDate);
        var items = itemsFor(dayDate);
        var nn = nowAndNext();
        var t = now();
        var state = {
            currentIds: nn.current.map(function (c) { return c.item; }),
            next: nn.next,
            past: nn.list.filter(function (it, i) { return itemWindow(nn.list, i).end <= t; })
        };

        var dress = events.map(function (e) { return e.dress_code; }).filter(Boolean)[0];

        // Group into blocks: the item's block, or else its event's title.
        var groups = [];
        items.forEach(function (it) {
            var ev = eventById(it.event_id);
            var name = it.block || (ev && events.length > 1 ? (ev.title + ' · ' + ev.location_name) : '');
            var g = groups[groups.length - 1];
            if (!g || g.name !== name) groups.push(g = { name: name, items: [] });
            g.items.push(it);
        });

        var hasSides = items.some(function (it) { return it.side === 'bride' || it.side === 'groom'; });

        var html = '<section class="wk-day' + (day.wedding ? ' is-wedding' : '') + '">' +
            '<header class="wk-day-head">' +
            '<p class="wk-day-date">' + esc(day.label) + '</p>' +
            '<h2>' + esc(day.title) + '</h2>' +
            (dress ? '<p class="wk-dress"><span>Dress code</span> ' + esc(dress) + '</p>' : '') +
            '</header>';

        if (dayDate === '2026-11-08') {
            html += '<div class="wk-callout"><span aria-hidden="true">🍻</span><p><strong>Where it all started.</strong> Booneshine is where we met, so come raise a glass where our story began, and say goodbye before you head home.</p></div>';
        }

        if (hasSides) {
            html += '<div class="wk-chips" role="group" aria-label="Show times for">' +
                chip('all', 'Everyone') + chip('bride', "Bride's side") + chip('groom', "Groom's side") + '</div>';
        }

        groups.forEach(function (g) {
            html += '<div class="wk-block">' +
                (g.name ? '<h3 class="wk-block-title">' + esc(g.name) + '</h3>' : '') +
                '<ol class="wk-timeline">' + g.items.map(function (it) { return renderItem(it, state); }).join('') + '</ol></div>';
        });

        html += '<div class="wk-places"><h3 class="wk-block-title">Where</h3>' + events.map(renderLocation).join('') + '</div>';
        html += '<button class="wk-btn wk-btn-ghost wk-cal" data-cal="' + dayDate + '">📅 Add ' + esc(day.label.split(',')[0]) + ' to my calendar</button>';
        html += '</section>';

        document.getElementById('day').innerHTML = html;
        applyFilter();
    }

    function chip(value, label) {
        return '<button class="wk-chip" data-side="' + value + '" aria-pressed="' + (sideFilter === value) + '">' + label + '</button>';
    }

    function applyFilter() {
        var lis = document.querySelectorAll('.wk-item');
        for (var i = 0; i < lis.length; i++) {
            var s = lis[i].getAttribute('data-side');
            lis[i].hidden = !(sideFilter === 'all' || s === 'all' || s === sideFilter);
        }
        var blocks = document.querySelectorAll('.wk-block');
        for (var j = 0; j < blocks.length; j++) {
            blocks[j].hidden = !blocks[j].querySelector('.wk-item:not([hidden])');
        }
    }

    function renderNow() {
        var el = document.getElementById('now');
        var t = now();
        var first = new Date(sortedItems()[0].start_time);
        var today = etDate(t);
        var inWeekend = today >= '2026-11-06' && today <= '2026-11-08';
        var html = '';

        if (t < first && !inWeekend) {
            var ms = first - t;
            var days = Math.floor(ms / 864e5);
            var hours = Math.floor((ms % 864e5) / 36e5);
            html = '<p class="wk-now-label">Countdown</p><p class="wk-now-big">' +
                (days > 0 ? days + (days === 1 ? ' day' : ' days') + ', ' : '') + hours + (hours === 1 ? ' hour' : ' hours') +
                '</p><p class="wk-now-small">until the weekend kicks off: Friday 3:45 PM at The Barn 💛</p>';
        } else if (inWeekend) {
            var nn = nowAndNext();
            if (nn.current.length) {
                html += '<p class="wk-now-label">Happening now</p>';
                nn.current.forEach(function (c) {
                    var ev = eventById(c.item.event_id);
                    html += '<p class="wk-now-big">' + esc(c.item.title) + '</p>' +
                        '<p class="wk-now-small">' + (ev ? esc(ev.location_name) + ' · ' : '') + 'until ' + esc(timeFmt.format(c.end)) + '</p>';
                });
            }
            if (nn.next && etDate(new Date(nn.next.start_time)) === today) {
                var mins = Math.round((new Date(nn.next.start_time) - t) / 60000);
                var inTxt = mins < 60 ? 'in ' + mins + ' min' : 'at ' + fmtTime(nn.next.start_time);
                html += '<p class="wk-now-label' + (nn.current.length ? ' wk-now-gap' : '') + '">Up next · ' + esc(inTxt) + '</p>' +
                    '<p class="wk-now-mid">' + esc(fmtTime(nn.next.start_time)) + ' · ' + esc(nn.next.title) + '</p>';
            } else if (!nn.current.length && nn.next) {
                html += '<p class="wk-now-label">Tomorrow starts</p><p class="wk-now-mid">' +
                    esc(fmtTime(nn.next.start_time)) + ' · ' + esc(nn.next.title) + '</p>';
            } else if (!nn.current.length && !nn.next) {
                html = '<p class="wk-now-big">That\'s a wrap! 💛</p><p class="wk-now-small">Thank you for being part of our weekend.</p>';
            }
        }

        el.innerHTML = html;
        el.hidden = !html;
    }

    function selectDay(dayDate, fromUser) {
        selectedDay = dayDate;
        var tabs = document.querySelectorAll('.wk-days button');
        for (var i = 0; i < tabs.length; i++) tabs[i].setAttribute('aria-selected', tabs[i].getAttribute('data-day') === dayDate);
        renderDay(dayDate);
        if (fromUser) {
            var top = document.getElementById('now').hidden ? document.querySelector('.wk-weather') : document.getElementById('now');
            window.scrollTo({ top: top.offsetTop - 70, behavior: 'smooth' });
        }
        var day = DAYS.filter(function (d) { return d.date === dayDate; })[0];
        if (day.wedding && etDate(now()) === day.date && !confettiDone) { confettiDone = true; confetti(); }
    }

    function renderGettingAround() {
        var el = document.getElementById('getting-around');
        var rows = data.getting_around || [];
        if (!rows.length) { el.hidden = true; return; }
        el.innerHTML = '<h2 class="wk-section-title">Getting around</h2>' + rows.map(function (r) {
            return '<article class="wk-place"><h3>' + esc(r.title) + '</h3>' +
                (r.details ? '<p class="wk-place-note">' + esc(r.details) + '</p>' : '') + '</article>';
        }).join('');
        el.hidden = false;
    }

    function renderAll() {
        renderNow();
        renderDay(selectedDay);
        renderGettingAround();
        document.getElementById('source').textContent = 'Schedule: ' + source;
    }

    // ---------- calendar (.ics) ----------
    function icsStamp(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    function icsText(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1'); }

    function downloadIcs(dayDate) {
        var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AB Wedding//Weekend//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
        var stamp = icsStamp(new Date());
        eventsFor(dayDate).forEach(function (ev) {
            var items = sortedItems().filter(function (it) { return it.event_id === ev.id; });
            if (!items.length) return;
            var start = new Date(items[0].start_time);
            var last = items[items.length - 1];
            var end = new Date(last.end_time || new Date(last.start_time).getTime() + 30 * 60000);
            var desc = items.map(function (it) {
                return fmtTime(it.start_time) + '  ' + it.title + (it.audience ? ' (' + it.audience + ')' : '');
            }).join('\n');
            if (ev.dress_code) desc = 'Dress code: ' + ev.dress_code + '\n\n' + desc;
            desc += '\n\nMountain weather is unpredictable, so bring a rain jacket!';
            lines.push('BEGIN:VEVENT',
                'UID:' + ev.id + '@ab-weekend',
                'DTSTAMP:' + stamp,
                'DTSTART:' + icsStamp(start),
                'DTEND:' + icsStamp(end),
                'SUMMARY:' + icsText(ev.title + ' · A & B Wedding'),
                'LOCATION:' + icsText(ev.address ? ev.location_name + ', ' + ev.address : ev.location_name),
                'DESCRIPTION:' + icsText(desc),
                'END:VEVENT');
        });
        lines.push('END:VCALENDAR');
        var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ab-wedding-' + dayDate + '.ics';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
    }

    // ---------- confetti (tiny, no library) ----------
    function confetti() {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        var c = document.getElementById('confetti');
        var ctx = c.getContext('2d');
        var w = c.width = innerWidth, h = c.height = innerHeight;
        var colors = ['#C6A86C', '#8A6F33', '#1C2A43', '#E8C9B9', '#FBFAF4'];
        var bits = [];
        for (var i = 0; i < 110; i++) bits.push({
            x: w / 2 + (Math.random() - .5) * 60, y: h * .35,
            vx: (Math.random() - .5) * 11, vy: -Math.random() * 11 - 3,
            r: Math.random() * 6 + 4, a: Math.random() * 6.28, va: (Math.random() - .5) * .3,
            col: colors[i % colors.length]
        });
        var frames = 0;
        c.style.display = 'block';
        (function tick() {
            ctx.clearRect(0, 0, w, h);
            bits.forEach(function (b) {
                b.vy += .28; b.vx *= .99; b.x += b.vx; b.y += b.vy; b.a += b.va;
                ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a);
                ctx.fillStyle = b.col; ctx.fillRect(-b.r / 2, -b.r / 4, b.r, b.r / 2); ctx.restore();
            });
            if (++frames < 150) requestAnimationFrame(tick);
            else { ctx.clearRect(0, 0, w, h); c.style.display = 'none'; }
        })();
    }

    // ---------- live data ----------
    function loadCached() {
        try {
            var raw = localStorage.getItem(CACHE_KEY);
            var d = raw && JSON.parse(raw);
            return d && d.events && d.events.length ? d : null;
        } catch (e) { return null; }
    }

    function refresh() {
        var ctrl = window.AbortController ? new AbortController() : null;
        var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 5000);
        fetch('/api/schedule', { signal: ctrl ? ctrl.signal : undefined })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (d) {
                clearTimeout(timer);
                if (!d || !d.events || !d.events.length || !d.timeline_items || !d.timeline_items.length) return;
                if (!d.getting_around) d.getting_around = [];
                data = d;
                source = 'live';
                try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch (e) {}
                renderAll();
            })
            .catch(function () { clearTimeout(timer); });
    }

    // ---------- wire up ----------
    document.querySelector('.wk-days').addEventListener('click', function (e) {
        var b = e.target.closest('button[data-day]');
        if (b) selectDay(b.getAttribute('data-day'), true);
    });
    document.getElementById('day').addEventListener('click', function (e) {
        var ch = e.target.closest('.wk-chip');
        if (ch) {
            sideFilter = ch.getAttribute('data-side');
            var all = document.querySelectorAll('.wk-chip');
            for (var i = 0; i < all.length; i++) all[i].setAttribute('aria-pressed', all[i] === ch);
            applyFilter();
            return;
        }
        var cal = e.target.closest('[data-cal]');
        if (cal) downloadIcs(cal.getAttribute('data-cal'));
    });

    var today = etDate(now());
    var start = DAYS.some(function (d) { return d.date === today; }) ? today : (today > '2026-11-08' ? '2026-11-08' : '2026-11-06');
    selectDay(start, false);
    renderAll();
    refresh();

    setInterval(function () { renderNow(); renderDay(selectedDay); }, 30000);
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) { renderNow(); renderDay(selectedDay); refresh(); }
    });
})();
