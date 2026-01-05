async function includeHTML(id, file) {  
  const response = await fetch(file);
  if (response.ok) {
    document.getElementById(id).innerHTML = await response.text();
  } else {
    console.error(`Nem sikerült betölteni: ${file}`);
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  // ✅ 1. Include HTML-ek betöltése (meg kell várni őket!)
  await includeHTML("header", "pieces/header.html");
});

//FRUZSI- kezdooldal
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
