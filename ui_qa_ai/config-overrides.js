module.exports = function override(config, env) {
    config.devServer = {
      ...config.devServer,
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }
  
        // Logic trước (tương đương onBeforeSetupMiddleware)
        middlewares.unshift({
          name: 'before-middleware',
          middleware: (req, res, next) => {
            console.log('Before setup middleware');
            next();
          },
        });
  
        // Logic sau (tương đương onAfterSetupMiddleware)
        middlewares.push({
          name: 'after-middleware',
          middleware: (req, res, next) => {
            console.log('After setup middleware');
            next();
          },
        });
  
        return middlewares;
      },
    };
  
    return config;
  };