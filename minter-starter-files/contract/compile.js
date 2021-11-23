const solc = require("solc");
const path = require("path");
const fs = require("fs");

const contractPath = path.resolve(__dirname, "BeenNice.sol");
const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "BeenNice.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

const wowLookAtThat = JSON.parse(solc.compile(JSON.stringify(input)));
module.exports = wowLookAtThat.contracts["BeenNice.sol"]["BeenNice"];

