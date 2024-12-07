import express from 'express';
import ejs from 'ejs';
const app = express();

app.use(express.static('public'));
app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.set("views", "./views");

app.get('/', (_, res) => {
    res.render('index.html');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
