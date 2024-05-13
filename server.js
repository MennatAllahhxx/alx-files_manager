import Express from 'express';
import router from './routes';

const app = new Express();

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('Server running on port ', port);
});
app.use(Express.json());
app.use('/', router);
