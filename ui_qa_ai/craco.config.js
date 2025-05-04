module.exports = {
    devServer: {
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error("Webpack Dev Server is not defined");
        }
        // Thêm middleware tùy chỉnh (có thể bỏ qua nếu chỉ cần loại bỏ cảnh báo)
        middlewares.push({
          name: "custom-middleware",
          middleware: (req, res, next) => {
            console.log("Custom middleware running...");
            next();
          },
        });
        return middlewares;
      },
    },
  };