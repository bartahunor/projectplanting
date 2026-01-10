import express from 'express';
import cors from 'cors';
import sql from './db.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Teszt endpoint
app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend működik 🚀" });
});

// Összes növény lekérése
app.get("/api/novenyek", async (req, res) => {
  try {
    const novenyek = await sql`SELECT * FROM novenyek ORDER BY magyar_nev`;
    res.json(novenyek);
  } catch (error) {
    console.error('Hiba a növények lekérésekor:', error);
    res.status(500).json({ error: 'Adatbázis hiba' });
  }
});

// Egy adott növény lekérése ID alapján
app.get("/api/novenyek/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const noveny = await sql`SELECT * FROM novenyek WHERE id = ${id}`;
    
    if (noveny.length === 0) {
      return res.status(404).json({ error: 'Növény nem található' });
    }
    
    res.json(noveny[0]);
  } catch (error) {
    console.error('Hiba a növény lekérésekor:', error);
    res.status(500).json({ error: 'Adatbázis hiba' });
  }
});

// Új növény hozzáadása
app.post("/api/novenyek", async (req, res) => {
  try {
    const { latin_nev, magyar_nev, faj, fajta, sortavolsag_cm, totavolsag_cm, jo_tarsak, rossz_tarsak } = req.body;
    
    const ujNoveny = await sql`
      INSERT INTO novenyek (latin_nev, magyar_nev, faj, fajta, sortavolsag_cm, totavolsag_cm, jo_tarsak, rossz_tarsak)
      VALUES (${latin_nev}, ${magyar_nev}, ${faj}, ${fajta}, ${sortavolsag_cm}, ${totavolsag_cm}, ${jo_tarsak}, ${rossz_tarsak})
      RETURNING *
    `;
    
    res.status(201).json(ujNoveny[0]);
  } catch (error) {
    console.error('Hiba a növény hozzáadásakor:', error);
    res.status(500).json({ error: 'Adatbázis hiba' });
  }
});

// Növény módosítása
app.put("/api/novenyek/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { latin_nev, magyar_nev, faj, fajta, sortavolsag_cm, totavolsag_cm, jo_tarsak, rossz_tarsak } = req.body;
    
    const modositottNoveny = await sql`
      UPDATE novenyek
      SET latin_nev = ${latin_nev},
          magyar_nev = ${magyar_nev},
          faj = ${faj},
          fajta = ${fajta},
          sortavolsag_cm = ${sortavolsag_cm},
          totavolsag_cm = ${totavolsag_cm},
          jo_tarsak = ${jo_tarsak},
          rossz_tarsak = ${rossz_tarsak}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (modositottNoveny.length === 0) {
      return res.status(404).json({ error: 'Növény nem található' });
    }
    
    res.json(modositottNoveny[0]);
  } catch (error) {
    console.error('Hiba a növény módosításakor:', error);
    res.status(500).json({ error: 'Adatbázis hiba' });
  }
});

// Növény törlése
app.delete("/api/novenyek/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const toroltNoveny = await sql`DELETE FROM novenyek WHERE id = ${id} RETURNING *`;
    
    if (toroltNoveny.length === 0) {
      return res.status(404).json({ error: 'Növény nem található' });
    }
    
    res.json({ message: 'Növény sikeresen törölve', noveny: toroltNoveny[0] });
  } catch (error) {
    console.error('Hiba a növény törlésekor:', error);
    res.status(500).json({ error: 'Adatbázis hiba' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Szerver fut: http://localhost:${PORT}`);
});