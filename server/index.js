const { app, env } = require('./src/app');

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Node backend listening on http://localhost:${env.port}`);
});

