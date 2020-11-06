const app = require('./app')({
  logger: true,
});
app.register(require('fastify-favicon'));

app.listen(process.env.PORT, '0.0.0.0', (err) => {
  if (err) throw err;
});
