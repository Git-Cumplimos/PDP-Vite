module.exports = {
  // style: {
  //   postcss: {
  //     plugins: [require("tailwindcss"), require("autoprefixer")],
  //   },
  // },
  webpack: {
    configure: {
      resolve: {
        fallback: {
          stream: require.resolve("stream-browserify"),
          buffer: require.resolve("buffer"),
          // crypto: require.resolve("crypto-browserify"),
          // stream: false,
          crypto: false,
        },
      },
    },
  },
};
