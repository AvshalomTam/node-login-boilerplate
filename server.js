const express = require('express');

const app = express();

app.set('view-engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index.ejs', { name: 'Avshalom' });
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
})

app.get('/register', (reg, res) => {
    res.render('register.ejs')
})

app.post('/register', (req, res) => {
    
})

app.get('*', (req, res) => {
    res.render('404Page.ejs')
})

app.listen(3000);