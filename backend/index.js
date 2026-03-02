import express from 'express';
import matchesrouter from './src/routes/matches.js';

const app = express();
app.use(express.json()); 
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use('/matches', matchesrouter)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
