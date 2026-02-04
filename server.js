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


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Szerver fut: http://localhost:${PORT}`);
});