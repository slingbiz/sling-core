const path = require("path");

module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    libraryTarget: "commonjs2",
  },
  externals: {
    react: "react",
    "react-dom": "react-dom",
    axios: "axios",
    "@material-ui/core": "@material-ui/core",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/, // Handles both regular CSS and CSS modules
        oneOf: [
          {
            resourceQuery: /module/, // For CSS modules (.module.css)
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: '[local]__[hash:base64:5]', // Scoped class names
                  },
                },
              },
            ],
          },
          {
            // Regular global CSS (no ?module in the import)
            use: ['style-loader', 'css-loader'],
            exclude: /node_modules/, // Ensure this is correct
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
    extensions: [".js", ".jsx"],
  },
};
