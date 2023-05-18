const { createHash } = require("crypto-browserify");

export const hash = (bodyObj) => {
  const string = JSON.stringify(bodyObj);
  return createHash("sha256").update(string).digest("hex");
};
