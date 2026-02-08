
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
  
  setActiveMenuItem();
  // Várunk egy kicsit, hogy a HTML elemek tényleg betöltődjenek
  setTimeout(() => {
    const novenyekLista = document.getElementById('novenyek-lista');
    if (novenyekLista) {
      console.log('Növények oldal észlelve, adatok betöltése...');
      betoltNovenyek();
    }
  }, 100);

});

function setActiveMenuItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'kezdooldal.html';
    const menuLinks = document.querySelectorAll('.alap-right .item a');
    console.log('Aktuális oldal:', currentPage);
    console.log('Talált linkek:', menuLinks.length);

    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        console.log('Ellenőrzés:', href, '===', currentPage);
        if (href === currentPage || (currentPage === '' && href === 'kezdooldal.html')) {
            link.classList.add('active');
            console.log('✅ Aktív link beállítva:', href);
        }
    });
}

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
window.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.carousel-track');
  
  // Ha nincs carousel az oldalon, ne futtassuk a kódot
  if (!track) {
    console.log('Nincs carousel ezen az oldalon');
    return;
  }
  
  const slides = Array.from(track.children);
  const prevButton = document.querySelector('.prev-btn');
  const nextButton = document.querySelector('.next-btn');

  if (!slides.length || !prevButton || !nextButton) {
    console.log('Carousel elemek hiányoznak');
    return;
  }

  let currentIndex = 0;

  function updateCarousel() {
    const slideWidth = slides[0].getBoundingClientRect().width;
    const moveAmount = slideWidth * currentIndex;
    track.style.transform = `translateX(-${moveAmount}px)`;
  }

  prevButton.addEventListener('click', () => {
    if (currentIndex === 0) {
      currentIndex = slides.length - 3;
    } else {
      currentIndex--;
    }
    updateCarousel();
  });

  nextButton.addEventListener('click', () => {
    if (currentIndex >= slides.length - 3) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    updateCarousel();
  });

  window.addEventListener('resize', updateCarousel);
  updateCarousel();
});


//HUNOR - API függvények
let novenyekglobal = [];
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
    novenyekglobal = novenyek; 
    
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
      <div class="noveny-card-left">
           <h2>${noveny.magyar_nev}</h2>
           <p><em>${noveny.latin_nev}</em></p>
           <p class="noveny-card-left-desc">A ${noveny.faj || 'N/A'} fajhoz tartozó ${noveny.magyar_nev} növény, azon belül a ${noveny.fajta || 'N/A'} fajtába.</p>
      </div>
      <div class="noveny-card-right"></div>
    `;
    // Most már a card-on belül keresünk, NEM az egész document-ben!
    const novenypic = card.querySelector('.noveny-card-right');
    
    if (noveny.kep) {
      novenypic.style.backgroundImage = `
        linear-gradient(to left, 
        rgba(156, 172, 126, 0.2) 0%, 
        rgba(156, 172, 126, 0.5) 60%,
        rgba(156, 172, 126, 1) 100%
        ),url('${noveny.kep}')
      `;
      novenypic.style.backgroundSize = 'cover';
      novenypic.style.backgroundPosition = 'center';
    } else {
      // Ha nincs kép, alapértelmezett háttér vagy szöveg
      novenypic.innerHTML = '<p>Nincs kép</p>';
      novenypic.style.backgroundColor = '#e0e0e0';
    }
    
    container.appendChild(card);
  });
}
window.addEventListener('DOMContentLoaded', () => {
  const novenyekLista = document.getElementById('novenyek-lista');
  if (novenyekLista) {
    console.log('Növények oldal észlelve, adatok betöltése...');
    betoltNovenyek();
  }
});
/*
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

*/
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



//FRUZSI - TERVEZŐ
window.addEventListener("DOMContentLoaded", async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const gotoTervezoBtn = document.getElementById("gotoTervezo");
    if (gotoTervezoBtn) {
        gotoTervezoBtn.addEventListener("click", () => {
            sessionStorage.setItem("fromKezdo", "true");
            window.location.href = "tervezo.html";
        });
        console.log("✓ Tervező gomb eseménykezelő hozzáadva");
    }

    const fromKezdo = sessionStorage.getItem("fromKezdo");
    const popupEl = document.getElementById("popup");

    if (fromKezdo === "true" && popupEl) {
        console.log("✓ Felhasználó a kezdőoldalról jött, popup betöltése...");

        sessionStorage.removeItem("fromKezdo");
        
        try {
            const response = await fetch("pieces/taj.html");

            if (!response.ok) {
                console.error("Nem sikerült betölteni: taj.html");
                alert("Hiba: nem sikerült betölteni a fájlt!");
                return;
            }

            const html = await response.text();
            
            popupEl.innerHTML = html;
            popupEl.classList.add("popuppage-active");
            
            console.log("✓ Popup oldal betöltve!");
        } catch (err) {
            console.error("Hiba történt betöltés közben:", err);
            alert("Hiba: " + err.message);
        }
    }
});


//FRUZSI - agyasok
function closePopup() {
    const popupEl = document.getElementById("popup");
    if (popupEl) {
        popupEl.classList.remove("popuppage-active"); 
        popupEl.innerHTML = '';
    }
}
function closePopupAndDisable() {
    const popupEl = document.getElementById("popup");
    if (popupEl) {
        popupEl.classList.remove("popuppage-active");
        popupEl.innerHTML = '';
        if (sourceBtn !== null && sourceBtn !== undefined) {
            sourceBtn.disabled = true;
            sourceBtn.style.backgroundColor = "#6cae6e";
            sourceBtn = null;
        }
    }

}
let sourceBtn = null;
async function openAgyasPopup() {
  try {
      const response = await fetch("pieces/agyas.html");
      const popupEl = document.getElementById("popup");

      if (!response.ok) {
          console.error("Nem sikerült betölteni: agyas.html");
          alert("Hiba: nem sikerült betölteni a fájlt!");
          return;
      }

      const html = await response.text();
            
      popupEl.innerHTML = html;
      popupEl.classList.add("popuppage-active");
            
      sourceBtn = document.activeElement;
      console.log("✓ Popup oldal betöltve!");
  } catch (err) {
      console.error("Hiba történt betöltés közben:", err);
      alert("Hiba: " + err.message);
  }
}


let count = 1;
let current = 1;
let data = [];
let area = 0;
let sorhossz = [];
let alakhossz = [];
let osszarea = 0;

function changeCount(val) {
    count = Math.min(100, Math.max(1, count + val));
    document.getElementById("count").innerText = count;
}

function start() {
    document.getElementById("step1").classList.add("hidden");
    document.getElementById("step2").classList.remove("hidden");
    showQuestion();
}

function showQuestion() {
    document.getElementById("title").innerText =
        current + ". terület megadása";
    document.getElementById("shape").value = "";
    document.getElementById("inputs").innerHTML = "";
}

function updateInputs() {
    const shape = document.getElementById("shape").value;
    const div = document.getElementById("inputs");
    div.innerHTML = "";

    if (shape === "square") {
        div.innerHTML = `
            <label>Oldalhossz:</label>
            <input type="number" id="a">
        `;
    } else if (shape === "rectangle") {
        div.innerHTML = `
            <label>Szélesség:</label>
            <input type="number" id="a">
            <label>Magasság:</label>
            <input type="number" id="b">
        `;
    }
}
function showAlert(message) {
    const alertDiv = document.getElementById("alert");
    alertDiv.innerText = message;
    alertDiv.style.display = "block";

        
    setTimeout(() => {
        alertDiv.style.display = "none";
    }, 3000);
}

function next() {
      const shape = document.getElementById("shape").value;
      if (!shape) {
          showAlert("Válassz alakot!"); 
          return;
      }

      const a = Number(document.getElementById("a")?.value);
      const b = Number(document.getElementById("b")?.value);

      if (shape === "square") {
          area = a * a;
          sorhossz.push(a * 100);
          alakhossz.push(a * 100);
          osszarea += area;
      } else if (shape === "rectangle") {
          area = a * b;
          sorhossz.push((a < b ? a : b) * 100);
          alakhossz.push((a > b ? a : b) * 100);
          osszarea += area;
      }

      data.push({ shape, a, b, area });

      if (current < count) {
          current++;
          showQuestion();
      } else {
          document.getElementById("step2").classList.add("hidden");
          document.getElementById("done").classList.remove("hidden");
          showResult();
      }
}

function showResult() {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";

    data.forEach((item, index) => {
        let shapeName = "";
        if (item.shape === "square") shapeName = "Négyzet";
        if (item.shape === "rectangle") shapeName = "Téglalap";
  
        resultDiv.innerHTML += `
            <p>
                <strong>${index + 1}. ágyás</strong><br>
                Alak: ${shapeName}<br>
                Terület: ${item.area.toFixed(2)} m² 
            </p>
            <hr>
        `;
    });
}

function renderBeds() {
    const container = document.getElementById("beds");
    container.innerHTML = "";

    // Carousel wrapper létrehozása
    const carouselWrapper = document.createElement("div");
    carouselWrapper.classList.add("carousel-wrapper");

    // Carousel track létrehozása
    const carouselTrack = document.createElement("div");
    carouselTrack.classList.add("carousel-track");
    carouselTrack.id = "carouselTrack";

    data.forEach(item => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("bed");

        const img = document.createElement("img");

        if (item.shape === "square") {
            img.src = "pictures/negyzet.png";
        }
        if (item.shape === "rectangle") {
            img.src = "pictures/teglalap.png";
        }

        img.classList.add("bed-img");

        img.onload = () => {
            console.log("Kép betöltve:", img.src);
        };

        wrapper.appendChild(img);
        carouselTrack.appendChild(wrapper);
    });

    carouselWrapper.appendChild(carouselTrack);

    // Navigációs gombok
    if (data.length > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.classList.add("carousel-btn", "prev");
        prevBtn.innerHTML = "❮";
        prevBtn.onclick = () => moveCarousel(-1);

        const nextBtn = document.createElement("button");
        nextBtn.classList.add("carousel-btn", "next");
        nextBtn.innerHTML = "❯";
        nextBtn.onclick = () => moveCarousel(1);

        carouselWrapper.appendChild(prevBtn);
        carouselWrapper.appendChild(nextBtn);
    }

    // Indikátorok
    if (data.length > 1) {
        const indicators = document.createElement("div");
        indicators.classList.add("carousel-indicators");
        indicators.id = "carouselIndicators";

        data.forEach((_, index) => {
            const dot = document.createElement("span");
            dot.classList.add("indicator-dot");
            if (index === 0) dot.classList.add("active");
            dot.onclick = () => goToSlide(index);
            indicators.appendChild(dot);
        });

        carouselWrapper.appendChild(indicators);
    }

    container.appendChild(carouselWrapper);
}

let currentSlide = 0;

function moveCarousel(direction) {
    const track = document.getElementById("carouselTrack");
    const slides = track.children;
    
    currentSlide += direction;
    
    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    } else if (currentSlide >= slides.length) {
        currentSlide = 0;
    }
    
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById("carouselTrack");
    const indicators = document.querySelectorAll(".indicator-dot");
    
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    indicators.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
}

//HUNOR - VALASZTAS POPUP
async function openValasztasPopup() {
  try {
      const response = await fetch("pieces/valasztas.html");
      const popupEl = document.getElementById("popup");

      if (!response.ok) {
          console.error("Nem sikerült betölteni: valasztas.html");
          alert("Hiba: nem sikerült betölteni a fájlt!");
          return;
      }

      const html = await response.text();
            
      // HTML betöltése
      popupEl.innerHTML = html;
      popupEl.classList.add("popuppage-active");
            
      console.log("✓ Popup oldal betöltve!");

    const response2 = await fetch('/api/novenyek');
    
    if (!response2.ok) {
      throw new Error(`HTTP hiba! Status: ${response2.status}`);
    }
    
    const novenyeklista = await response2.json();
      setTimeout(() => {
          const plantSelect = document.getElementById("plant-select");
          
          if (!plantSelect) {
              console.error("plant-select elem nem található!");
              return;
          }

          novenyeklista.forEach(noveny => {
              const option = document.createElement("option");
              option.value = noveny.magyar_nev;
              option.text = noveny.magyar_nev;
              plantSelect.appendChild(option);
              if (novenyekglobal.length === 0) {
                  novenyekglobal = novenyeklista;
              }
          });

          console.log("✓ Növények hozzáadva a selecthez!");
      }, 50);
      sourceBtn = document.activeElement;
  } catch (err) {
      console.error("Hiba történt betöltés közben:", err);
      alert("Hiba: " + err.message);
  }
}



let selectedPlants = []; // ide kerülnek a hozzáadott növények

function showPlantAlert(message) {
    const alertDiv = document.getElementById("plant-alert");
    alertDiv.innerText = message;
    alertDiv.style.display = "block";

    setTimeout(() => {
        alertDiv.style.display = "none";
    }, 3000);
}

function clearPlantAlert() {
    const alertDiv = document.getElementById("plant-alert");
    alertDiv.style.display = "none";
}

// növény hozzáadása a listához
function addPlant() {
    const plantSelect = document.getElementById("plant-select");
    const quantityInput = document.getElementById("plant-quantity");

    const plantName = plantSelect.value;
    const quantity = Number(quantityInput.value);

    if (!plantName) {
        showPlantAlert("Válassz növényt!");
        return;
    }
    if (quantity < 1) {
        showPlantAlert("Adj meg legalább 1 darabot!");
        return;
    }

    // hozzáadjuk a selectedPlants tömbhöz
    selectedPlants.push({ name: plantName, quantity });
    renderPlantList();

    // reset input
    plantSelect.value = "";
    quantityInput.value = 1;
}

// megjelenítés a popupban
function renderPlantList() {
    const listDiv = document.getElementById("plant-list");
    listDiv.innerHTML = "";

    selectedPlants.forEach((plant, index) => {
        const item = document.createElement("div");
        item.classList.add("plant-item");
        item.innerText = `${plant.name} x${plant.quantity}`;
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "✕";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.onclick = () => {
            selectedPlants.splice(index, 1);
            renderPlantList();
        };
        item.appendChild(deleteBtn);
        listDiv.appendChild(item);
    });
}

//HUNOR  ültetés gomb
const agyasMap = new Map();
function plantNow() {
  let neededarea = 0;
  let novenyekbeul = [];
  novenyekglobal.forEach(noveny => {
      selectedPlants.forEach(selected => {
          if (noveny.magyar_nev === selected.name) {
              neededarea += (noveny.sortavolsag_cm * noveny.totavolsag_cm) * selected.quantity;
              for (let i = 0; i < selected.quantity; i++) {
                  novenyekbeul.push(noveny);
              }
          }
      });
  });

  console.log("Szükséges terület (cm²):", neededarea);
  console.log("Elérhető terület (cm²):", osszarea * 10000);




  console.log("Elég hely van az ágyásokban a kiválasztott növények számára!");

  // Növények pontozása és rendezése több szempont alapján nem feltétlen használom
  let score = 0;
  let novenyscore = new Map();
  novenyekbeul.forEach(noveny => {
    let score = 0;

    score -= (noveny.sortavolsag_cm * noveny.totavolsag_cm) / 100;
      
    const rosszTarsakSzam = noveny.rossz_tarsak 
        ? noveny.rossz_tarsak.split(',').length 
        : 0;
      
    const joTarsakSzam = noveny.jo_tarsak 
        ? noveny.jo_tarsak.split(',').length 
        : 0;
      
    score += joTarsakSzam * 5;
      
    score -= rosszTarsakSzam * 3;
  });
  const rendezettNovenyek = Array.from(novenyscore.entries()).sort((a, b) => b[1] - a[1]);
  console.log("Növények pontszám szerint rendezve:", rendezettNovenyek);



  // ===== SOROK FELTÖLTÉSE =====
  let agyasindex = 0;
  console.log(novenyekbeul);
  
  

  while (agyasindex < alakhossz.length && novenyekbeul.length > 0) {

    const agyasSzam = agyasindex + 1;
    console.log(`🟫 ${agyasSzam}. ágyás kezdése`);
    if (!agyasMap.has(agyasSzam)) {
        agyasMap.set(agyasSzam, []);
    }

    let maradekAlakhossz = alakhossz[agyasindex];
    while (novenyekbeul.length > 0 && maradekAlakhossz > 0) {

      let index = 0;
      
      if (index >= novenyekbeul.length) break;
      
      let aktualisNoveny = novenyekbeul[index];
      let sorszelesseg = aktualisNoveny.sortavolsag_cm;
      let nemkompatibilis = aktualisNoveny.rossz_tarsak 
          ? aktualisNoveny.rossz_tarsak.split(',').map(s => s.trim()) 
          : [];
      console.log(nemkompatibilis);
      console.log(aktualisNoveny.id);
      
      if (sorszelesseg > maradekAlakhossz) {
          console.log("⚠️ Nincs több hely soroknak");
          break;
      }
      
      let egysor = [];
      let currentsorhossz = sorhossz[agyasindex];
      
      egysor.push(aktualisNoveny.magyar_nev);
      novenyekbeul.splice(index, 1);
      currentsorhossz -= aktualisNoveny.totavolsag_cm;
      
      let k = 0;
      while (k < novenyekbeul.length) {
          let noveny = novenyekbeul[k];
          let idstr = noveny.id.toString();

          if (noveny.sortavolsag_cm <= sorszelesseg && 
              noveny.totavolsag_cm <= currentsorhossz && nemkompatibilis.includes(idstr) === false) {
              
              egysor.push(noveny.magyar_nev);
              currentsorhossz -= noveny.totavolsag_cm;
              novenyekbeul.splice(k, 1);
              nemkompatibilis = noveny.rossz_tarsak 
                ? noveny.rossz_tarsak.split(',').map(s => s.trim()) 
                : [];
              
          } else {
              k++; 
          }
      }
      
      agyasMap.get(agyasSzam).push(egysor);
      maradekAlakhossz -= sorszelesseg;
      
      console.log(`Sor hozzáadva: [${egysor.join(', ')}], maradék szélesség: ${maradekAlakhossz}cm`);
      if (novenyekbeul.length > 0) {
          console.log("❗ Bent maradt növények:", novenyekbeul.map(n => n.magyar_nev));
      }
    }
    agyasindex++;
    console.log(`🟫 ${agyasindex}. ágyás vége`);
  }

  console.log("🌱 Ágyás Map:", agyasMap);
  drawUltetes(agyasMap);
  if (novenyekbeul.length > 0) {
    openListaPopup(novenyekbeul);
  }

  if (agyasMap.size > 0) {
      const emailBtn = document.querySelector(".email-send-btn");
      emailBtn.style.backgroundColor = "#4CAF50"; // aktív zöld
      emailBtn.disabled = false;

      const plantBtn = document.getElementById("plant-now-btn");
      plantBtn.style.backgroundColor = "#6cae6e";
      plantBtn.disabled = true;
  }

}


function drawUltetes(agyasMap) {
    if (!agyasMap) return;

    const bedDivs = document.querySelectorAll(".bed");

    bedDivs.forEach((bed, index) => {
        const agyasSzam = index + 1;
        const sorok = agyasMap.get(agyasSzam);
        if (!sorok) return;

        // Overlay létrehozása
        let overlay = bed.querySelector(".bed-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.classList.add("bed-overlay");
            bed.appendChild(overlay);
        }

        let imgwidth = bed.querySelector(".bed-img").clientWidth;
        let imgheight = bed.querySelector(".bed-img").clientHeight;
        let beddivwidth = bed.clientWidth;
        let beddivheight = bed.clientHeight;
        let olwidth = imgwidth / beddivwidth * 100;
        let olheight = imgheight / beddivheight * 100;
        console.log(`Ágyás ${agyasSzam} méretei: ${olwidth}% x ${olheight}%`);
        // Reset overlay
        overlay.innerHTML = "";

        // Overlay stílus
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.width = olwidth + "%";
        overlay.style.height = olheight + "%";
        overlay.style.padding = "2px";
        overlay.style.boxSizing = "border-box";
        overlay.style.overflow = "auto";

        const imgSize = 50; // fix méret
        const gap = 4;
        
        let imgpercent = 100 / Math.max(...Array.from(agyasMap.values()).flat().map(arr => arr.length));
        console.log(`Kép méret százalékban: ${imgpercent}%`);
        // Sorok hozzáadása
        sorok.forEach(sor => {
            const rowDiv = document.createElement("div");
            rowDiv.style.display = "flex";
            rowDiv.style.flexWrap = "nowrap";
            rowDiv.style.justifyContent = "center";
            rowDiv.style.alignItems = "center";
            rowDiv.style.width = "100%";
            rowDiv.style.gap = "4px";
            rowDiv.style.overflow = "hidden";


            sor.forEach(novenyNev => {
                const noveny = novenyekglobal.find(n => n.magyar_nev === novenyNev);

                // Négyzetes konténer
                const imgWrapper = document.createElement("div");
                imgWrapper.style.flex = "1 1 0";
                imgWrapper.style.aspectRatio = "1 / 1"; // 🔥 négyzet
                imgWrapper.style.maxWidth = "100%";
                imgWrapper.style.display = "flex";
                imgWrapper.style.alignItems = "center";
                imgWrapper.style.justifyContent = "center";
                imgWrapper.style.overflow = "hidden";

                const img = document.createElement("img");
                img.src = noveny ? `pictures/${noveny.faj}.png` : "pictures/default.png";
                img.alt = novenyNev;
                img.title = novenyNev;

                img.style.width = "100%";
                img.style.height = "100%";
                img.style.maxWidth = "50px";
                img.style.maxHeight = "50px";
                img.style.minHeight = "20px";
                img.style.minWidth = "20px";
                img.style.objectFit = "contain"; // nem lóg ki, nem torzul

                imgWrapper.appendChild(img);
                rowDiv.appendChild(imgWrapper);
            });

            overlay.appendChild(rowDiv);
        });
    });
}




window.addEventListener('DOMContentLoaded', function() {
  // Inicializálás (ez egyszer kell, pl. az app indulásakor)
  emailjs.init('ffvqP6xTeKY8xJqxR'); // A te public key-ed
});
async function kuldesEmail() {
  let text = mapToString(agyasMap);
  console.log(text);

  const templateParams = {
    user_name: document.getElementById('receiver-name').value,
    to_email: document.getElementById('receiver-email').value,
    plan: text,  // Ez megy a {{message}} helyére
  };
  
  try {
    await emailjs.send('service_8embcep', 'template_72ieegd', templateParams);
    alert('Email elküldve!');
    resetEverything();
  } catch (error) {
    console.error('Hiba:', error);
    alert('Nem sikerült!');
  }
}

function mapToString(agyasokMap, novenyekbeul) {
  let result = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
  result += `🌱 KERTED TERVE 🌱\n`;
  result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  // Végigmegyünk az ágyásokon
  agyasokMap.forEach((sorok, agyasIndex) => {
    result += `📦 ÁGYÁS #${agyasIndex} ---------------- \n\n`;
    
    // Végigmegyünk a sorokon
    sorok.forEach((noveynyek, sorIndex) => {
      result += `  🌿 ${sorIndex + 1}. sor:\n`;
      result += `     ${noveynyek.join(', ')}\n\n`;
    });
  });
  result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  if (novenyekbeul && novenyekbeul.length > 0) {
    result += `KIMARADT NÖVÉNYEK: `;
    novenyekbeul.forEach(noveny => {
      result += `${noveny.magyar_nev},`;
    });
  }
  return result;
}

//FRUZSI-lista
async function openListaPopup(novenyekbeul) {
  try {
      const response = await fetch("pieces/lista.html");
      const popupEl = document.getElementById("popup");

      if (!response.ok) {
          console.error("Nem sikerült betölteni: lista.html");
          alert("Hiba: nem sikerült betölteni a fájlt!");
          return;
      }

      const html = await response.text();
            
      // HTML betöltése
      popupEl.innerHTML = html;
      popupEl.classList.add("popuppage-active");
            
      console.log("✓ Popup oldal betöltve!");

      const popup = document.getElementById('missed-popup');
    const list = document.getElementById('missed-list');
    list.innerHTML = ''; // ürítjük

    if(novenyekbeul.length === 0) {
        list.innerHTML = '<div class="missed-item">Nincs kimaradt elem</div>';
    } else {
          // Összesítés: számoljuk meg hogy melyik növényből hány darab van
          const novenyekSzamlalo = {};
          
          novenyekbeul.forEach(noveny => {
              const nev = noveny.magyar_nev;
              if (novenyekSzamlalo[nev]) {
                  novenyekSzamlalo[nev]++;
              } else {
                  novenyekSzamlalo[nev] = 1;
              }
          });
          
          // Megjelenítés
          Object.entries(novenyekSzamlalo).forEach(([nev, darab]) => {
              const div = document.createElement('div');
              div.classList.add('missed-item');
              div.innerHTML = `<span>${nev}</span> <span>x ${darab}</span>`;
              list.appendChild(div);
          });
      }
    
      
  } catch (err) {
      console.error("Hiba történt betöltés közben:", err);
      alert("Hiba: " + err.message);
  }
}



//FRUZSI-visszagomb
function goHome() {
    window.location.href = "kezdooldal.html"; // cseréld a főoldalad URL-jére
}

function resetEverything() {
  // Globális változók nullázása
  count = 1;
  current = 1;
  data = [];
  area = 0;
  sorhossz = [];
  alakhossz = [];
  osszarea = 0;
  selectedPlants = [];
  currentSlide = 0;
  agyasMap.clear(); 
  
  const receiverName = document.getElementById('receiver-name');
  const receiverEmail = document.getElementById('receiver-email');
  if (receiverName) receiverName.value = '';
  if (receiverEmail) receiverEmail.value = '';
  
  const bedsContainer = document.getElementById('beds');
  if (bedsContainer) {
    bedsContainer.innerHTML = '';
  }
  
  const emailBtn = document.querySelector('.email-send-btn');
  if (emailBtn) {
    emailBtn.disabled = true;
    emailBtn.style.backgroundColor = '#666';
  }

  const agyasBtn = document.getElementById("agyas-btn");
  const plantNowBtn = document.getElementById("plant-now-btn");
  const valasztasBtn = document.getElementById("valasztas-btn");
  if (agyasBtn) {
    agyasBtn.disabled = false;
    agyasBtn.style.backgroundColor = ' #2e7d32';
  }
  if (plantNowBtn) {
    plantNowBtn.disabled = false;
    plantNowBtn.style.backgroundColor = ' #2e7d32';
  }
  if (valasztasBtn) {
    valasztasBtn.disabled = false;
    valasztasBtn.style.backgroundColor = ' #2e7d32';
  }
  
  // Popup bezárása ha nyitva van
  closePopup();
  
  console.log('✅ Minden alaphelyzetbe állítva!');
}