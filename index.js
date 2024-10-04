const express = require('express');

const app = express();
app.listen(8000);

app.post('/short/*', (req, res, next) => {
    const url = req.params[0];

    console.log(typeof url);
    console.log(url);

    res.send(url);

    return next();
});


app.get('/', (req, res, next) => {
    res.send('Hello world!');

    return next();
});