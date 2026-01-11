async function includeHTML(id, file) {  
  const response = await fetch(file);
  if (response.ok) {
    document.getElementById(id).innerHTML = await response.text();
  } else {
    console.error(`Nem sikerült betölteni: ${file}`);
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  await includeHTML("header", "pieces/header.html");
  await includeHTML("footer", "pieces/footer.html");
});

function toggleMenu() {
    const menu = document.querySelector('.alap-right');
    const toggle = document.querySelector('.menu-toggle');
    menu.classList.toggle('active');
    toggle.classList.toggle('active');
}

// Bezárja a menüt, ha linkre kattintunk
document.querySelectorAll('.alap-right a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.alap-right').classList.remove('active');
    });
});

//FRUZSI - kezdooldal
const ratio = 0.1;
const options = {
  root: null,
  rootMargin: '0px',
  threshold: ratio
}

function handleIntersect(entries, observer) {
  entries.forEach(function(entry) {
    if(entry.intersectionRatio > ratio) {
      entry.target.classList.add('fx-reveal-visible')
      observer.unobserve(entry.target);
    }
  })
}

const observer = new IntersectionObserver(handleIntersect, options);

document.querySelectorAll('.fx-reveal').forEach(function(r) {
  observer.observe(r);
});


//FRUZSI - görgetés

function velemenyekScroll() {
    const rolunk = document.querySelector('.semmi');
    const velemenyek = document.querySelector('.rolunk');
    if (!rolunk || !velemenyek) return;

    const rect = rolunk.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const speedFactor = 1.5;

    let progress = (windowHeight - rect.bottom) / rect.height;
    progress = Math.min(Math.max(progress, 0), 1);

    let translateY = 100 - progress * 100 * speedFactor;
    translateY = Math.min(100, Math.max(0, translateY));

    velemenyek.style.transform = `translateY(${translateY}%)`;
}

window.addEventListener('scroll', velemenyekScroll);
window.addEventListener('resize', velemenyekScroll);
document.addEventListener('DOMContentLoaded', velemenyekScroll);


function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0
    );
  }

  function checkScrollAnimations() {
    const elements = document.querySelectorAll('.scroll-anim');
    elements.forEach(el => {
      if (isInViewport(el)) {
        el.classList.add('in-view');
      } else {
        el.classList.remove('in-view');
      }
    });
  }

  document.addEventListener('scroll', checkScrollAnimations);
  document.addEventListener('DOMContentLoaded', checkScrollAnimations);

//FRUZSI - vélemények
const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const prevButton = document.querySelector('.prev-btn');
const nextButton = document.querySelector('.next-btn');

let currentIndex = 0;

function updateCarousel() {
  const slideWidth = slides[0].getBoundingClientRect().width;
  const moveAmount = slideWidth * currentIndex;
  track.style.transform = `translateX(-${moveAmount}px)`;
}

prevButton.addEventListener('click', () => {
  if (currentIndex === 0) {
    currentIndex = slides.length - 3; // visszalép az utolsó 3 elem elsőjére
  } else {
    currentIndex--;
  }
  updateCarousel();
});

nextButton.addEventListener('click', () => {
  if (currentIndex >= slides.length - 3) {
    currentIndex = 0; // újra az elejére ugrik
  } else {
    currentIndex++;
  }
  updateCarousel();
});

window.addEventListener('resize', updateCarousel);

updateCarousel();


//HUNOR - API függvények

// Backend kapcsolat teszt
fetch("/api/hello")
  .then(res => res.json())
  .then(data => {
    console.log(data.message);
  })
  .catch(error => console.error('Backend hiba:', error));

// Összes növény lekérése
async function betoltNovenyek() {
  try {
    const response = await fetch('/api/novenyek');
    
    if (!response.ok) {
      throw new Error(`HTTP hiba! Status: ${response.status}`);
    }
    
    const novenyek = await response.json();
    
    // Ellenőrizzük, hogy tömb-e
    if (!Array.isArray(novenyek)) {
      console.error('A válasz nem tömb:', novenyek);
      return;
    }
    
    console.log('Növények:', novenyek);
    megjelenit(novenyek);
  } catch (error) {
    console.error('Hiba a növények betöltésekor:', error);
    const container = document.getElementById('novenyek-lista');
    if (container) {
      container.innerHTML = '<p style="color: red;">Hiba az adatok betöltésekor. Ellenőrizd az adatbázis kapcsolatot!</p>';
    }
  }
}

// Növények megjelenítése az oldalon
function megjelenit(novenyek) {
  const container = document.getElementById('novenyek-lista');
  
  if (!container) {
    console.log('Nincs "novenyek-lista" elem az oldalon');
    return;
  }
  
  container.innerHTML = '';
  
  novenyek.forEach(noveny => {
    const card = document.createElement('div');
    card.className = 'noveny-card';
    card.innerHTML = `
      <h3>${noveny.magyar_nev}</h3>
      <p><em>${noveny.latin_nev}</em></p>
      <p><strong>Faj:</strong> ${noveny.faj || 'N/A'}</p>
      <p><strong>Fajta:</strong> ${noveny.fajta || 'N/A'}</p>
      <p><strong>Sortávolság:</strong> ${noveny.sortavolsag_cm || 'N/A'} cm</p>
      <p><strong>Tőtávolság:</strong> ${noveny.totavolsag_cm || 'N/A'} cm</p>
      <p><strong>Jó társak:</strong> ${noveny.jo_tarsak}</p>
      <p><strong>Rossz társak:</strong> ${noveny.rossz_tarsak}</p>
    `;
    container.appendChild(card);
  });
}

// Egy adott növény lekérése ID alapján
async function lekeresNoveny(id) {
  try {
    const response = await fetch(`/api/novenyek/${id}`);
    const noveny = await response.json();
    console.log('Növény:', noveny);
    return noveny;
  } catch (error) {
    console.error('Hiba a növény lekérésekor:', error);
  }
}

// Új növény hozzáadása
async function ujNoveny(novenyAdatok) {
  try {
    const response = await fetch('/api/novenyek', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novenyAdatok)
    });
    
    const ujNoveny = await response.json();
    console.log('Új növény hozzáadva:', ujNoveny);
    
    // Újratöltjük a listát
    await betoltNovenyek();
    return ujNoveny;
  } catch (error) {
    console.error('Hiba az új növény hozzáadásakor:', error);
  }
}

// Növény módosítása
async function modositNoveny(id, novenyAdatok) {
  try {
    const response = await fetch(`/api/novenyek/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novenyAdatok)
    });
    
    const modositottNoveny = await response.json();
    console.log('Növény módosítva:', modositottNoveny);
    
    // Újratöltjük a listát
    await betoltNovenyek();
    return modositottNoveny;
  } catch (error) {
    console.error('Hiba a növény módosításakor:', error);
  }
}

// Növény törlése
async function torolNoveny(id) {
  try {
    const response = await fetch(`/api/novenyek/${id}`, {
      method: 'DELETE'
    });
    
    const eredmeny = await response.json();
    console.log('Növény törölve:', eredmeny);
    
    // Újratöltjük a listát
    await betoltNovenyek();
    return eredmeny;
  } catch (error) {
    console.error('Hiba a növény törlésekor:', error);
  }
}

// Példa használatra:
// ujNoveny({
//   latin_nev: 'Solanum lycopersicum',
//   magyar_nev: 'Paradicsom',
//   faj: 'zöldség',
//   fajta: 'koktélparadicsom',
//   sortavolsag_cm: 50,
//   totavolsag_cm: 40,
//   jo_tarsak: 'bazsalikom, sárgarépa',
//   rossz_tarsak: 'burgonya, uborka'
// });
betoltNovenyek();