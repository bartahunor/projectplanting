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