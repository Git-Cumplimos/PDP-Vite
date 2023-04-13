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
          crypto: require.resolve("crypto-browserify"),
        },
      },
    },
  },
};
