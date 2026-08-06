/* ============================================================
   Gold Phi Arife — script.js
   Minimal vanilla JS · Geen framework · Geen build step
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. HEADER — achtergrond bij scrollen
  ---------------------------------------------------------- */
  const header = document.getElementById('site-header');

  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ----------------------------------------------------------
     2. MOBIEL MENU — toggle
  ---------------------------------------------------------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navLinks.classList.toggle('open');
      document.body.classList.toggle('nav-open');
    });

    // Sluit menu als een link wordt aangeklikt
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
        document.body.classList.remove('nav-open');
      });
    });
  }

  /* ----------------------------------------------------------
     3. SMOOTH SCROLL — anchor links
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;

      window.scrollTo({
        top: top,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    });
  });

  /* ----------------------------------------------------------
     4. FADE-IN — IntersectionObserver
        16 px omhoog, 240 ms, ease, één keer bij binnenkomst.
        Bij prefers-reduced-motion: geen animatie.
  ---------------------------------------------------------- */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  if (!prefersReducedMotion()) {
    var fadeEls = document.querySelectorAll('.fade-in');

    if (fadeEls.length && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('zichtbaar');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      fadeEls.forEach(function (el) {
        observer.observe(el);
      });
    }
  } else {
    // Reduced motion: maak alles meteen zichtbaar
    document.querySelectorAll('.fade-in').forEach(function (el) {
      el.classList.add('zichtbaar');
    });
  }

  /* ----------------------------------------------------------
     5. MOBIEL STICKY BALK — verberg in footer
  ---------------------------------------------------------- */
  var mobileBalk = document.querySelector('.mobiel-balk');
  var siteFooter = document.querySelector('footer');

  if (mobileBalk && siteFooter && 'IntersectionObserver' in window) {
    var footerObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            mobileBalk.classList.add('verborgen');
          } else {
            mobileBalk.classList.remove('verborgen');
          }
        });
      },
      { threshold: 0.1 }
    );

    footerObs.observe(siteFooter);
  }

  /* ----------------------------------------------------------
     6. FAQ — native <details name="faq"> is al exclusief
        in moderne browsers. Geen extra JS nodig.
        Hier alleen voor visuele open/close transitie.
  ---------------------------------------------------------- */
  // Native <details name="faq"> maakt accordion exclusief.
  // Geen extra JS vereist.

  /* ----------------------------------------------------------
     7. AFSPRAAK MAKEN — keuzedialoog
        Stap 1 categorie -> stap 2 behandeling + tarief -> WhatsApp.
        De knoppen blijven gewone wa.me-links: zonder JS werkt de
        oude route dus gewoon door.
  ---------------------------------------------------------- */
  var boek = document.getElementById('boek');

  if (boek && typeof boek.showModal === 'function') {
    var boekStap1  = boek.querySelector('[data-stap="1"]');
    var boekStap2  = boek.querySelector('[data-stap="2"]');
    var boekGroepen = boek.querySelectorAll('.boek-groep');
    var boekKeuze  = boek.querySelector('[data-boek-keuze]');
    var boekVerder = boek.querySelector('[data-boek-verder]');
    var boekInhoud = boek.querySelector('.boek-inhoud');
    var WA_BASIS   = 'https://wa.me/32485140436?text=';

    function boekToonStap(nummer, categorie) {
      var tweede = nummer === 2;
      boekStap1.hidden = tweede;
      boekStap2.hidden = !tweede;

      boekGroepen.forEach(function (groep) {
        groep.hidden = groep.getAttribute('data-categorie') !== categorie;
      });

      if (boekInhoud) boekInhoud.scrollTop = 0;
    }

    function boekWisKeuze() {
      boek.querySelectorAll('input[name="dienst"]').forEach(function (radio) {
        radio.checked = false;
      });
      boekKeuze.textContent = 'Nog geen behandeling gekozen';
      boekVerder.classList.add('btn--uit');
      boekVerder.setAttribute('aria-disabled', 'true');
      boekVerder.href = WA_BASIS + encodeURIComponent(
        'Hallo Gold Phi Arife, ik wil graag een afspraak maken.'
      );
    }

    function boekOpen(categorie, dienst) {
      boekWisKeuze();
      boekToonStap(categorie ? 2 : 1, categorie);

      // Aanbodknoppen mogen meteen op één behandeling landen, zodat de
      // bezoeker niet nogmaals hoeft te kiezen wat hij net aanklikte.
      if (dienst) {
        var radio = boek.querySelector('input[name="dienst"][data-naam="' + dienst + '"]');
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      boek.showModal();
      document.body.style.overflow = 'hidden';
    }

    // Alle "Afspraak maken"-knoppen, dienstkaarten en aanbodknoppen
    document.querySelectorAll('[data-boek-open]').forEach(function (knop) {
      knop.addEventListener('click', function (e) {
        e.preventDefault();
        boekOpen(this.getAttribute('data-categorie'), this.getAttribute('data-dienst'));
      });
    });

    // Stap 1 -> stap 2
    boek.querySelectorAll('.boek-cat').forEach(function (knop) {
      knop.addEventListener('click', function () {
        boekToonStap(2, this.getAttribute('data-categorie'));
      });
    });

    // Terug naar het overzicht
    var boekTerug = boek.querySelector('[data-boek-terug]');
    if (boekTerug) {
      boekTerug.addEventListener('click', function () {
        boekWisKeuze();
        boekToonStap(1);
      });
    }

    // Keuze -> WhatsApp-bericht opbouwen
    boek.addEventListener('change', function (e) {
      var radio = e.target;
      if (!radio.matches || !radio.matches('input[name="dienst"]')) return;

      var naam  = radio.getAttribute('data-naam');
      var prijs = radio.getAttribute('data-prijs');

      boekKeuze.innerHTML = 'Gekozen: <strong></strong>';
      boekKeuze.querySelector('strong').textContent = naam + ' — ' + prijs;

      boekVerder.href = WA_BASIS + encodeURIComponent(
        'Hallo Gold Phi Arife, ik wil graag een afspraak maken voor ' +
        naam + ' (' + prijs + ').'
      );
      boekVerder.classList.remove('btn--uit');
      boekVerder.removeAttribute('aria-disabled');
    });

    // Nog niets gekozen: knop mag niet doorklikken
    boekVerder.addEventListener('click', function (e) {
      if (this.classList.contains('btn--uit')) e.preventDefault();
    });

    // Sluiten: kruisje, klik op de achtergrond, of Esc (native)
    boek.querySelectorAll('[data-boek-sluit]').forEach(function (knop) {
      knop.addEventListener('click', function () { boek.close(); });
    });

    boek.addEventListener('click', function (e) {
      if (e.target === boek) boek.close();
    });

    boek.addEventListener('close', function () {
      document.body.style.overflow = '';
    });
  }

})();
