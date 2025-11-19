import express from 'express';
import { processClaim } from './source/processClaim.ts';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/evaluateClaim', (req, res) => {
  const payload = req.body;
  try {
    const result = processClaim(payload);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.listen(8000, () => {
    console.log('Server is running on http://localhost:8000');
});
