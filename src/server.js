/* eslint no-console: 0 */
import 'ignore-styles';
import path from 'path';
import {Server} from 'http';
import Express from 'express';
import proxy from 'proxy-middleware';
import url from 'url';
import compression from 'compression';
import bodyParser from 'body-parser';
import translationRouter from 'wbc-components/lib/api/translation/router';

const port = 8888;
const app = new Express();
const server = new Server(app);

app.locals.env = process.env;

app.use(compression());
app.use(bodyParser.json());

const buildPath = path.join(__dirname + './../build/');
const webpackDevServerBuildPath = 'http://0.0.0.0:9000/build/';
if (process.env.NODE_ENV === 'production') {
	app.use('/build', Express.static(buildPath, { maxAge: '1y' }));
	app.set('views', buildPath);
} else {
	app.use('/build', proxy(url.parse(webpackDevServerBuildPath)));
	app.set('views', buildPath);
}

const fontsPath = path.join(__dirname + './../fonts/');
app.use('/fonts', Express.static(fontsPath, { maxAge: '1y' }));
const localePath = path.join(__dirname + './../locale/');
app.use('/locale', Express.static(localePath));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('*', (req, res) => {
	let markup = '';
	let status = 200;
	return res.status(status).render('index', {markup});
});

app.use('/', translationRouter);

server.listen(port, () => {
	console.log('Node server listening on *: ' + port);
});