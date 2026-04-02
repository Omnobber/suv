module.exports = {
  apps: [
    {
      name: 'belimaa',
      cwd: './backend',
      script: 'src/server.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
