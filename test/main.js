const { readFileSync } = require("fs");
const { main } = require("../lib/main.js");

const minimal = {
  version: "1.6.0",
  metadata: {
    client: {
      name: "appmap-validate",
      url: "https://github.com/applandinc/appmap-validate",
    },
    recorder: {
      name: "appmap-validate",
    },
  },
  classMap: [],
  events: [],
};

main({
  data: {
    ...minimal,
    classMap: [{
      type: "package",
      name: "script.js",
      children: [{
        type: "class",
        name: "C",
        children: [{
          type: "function",
          path
        }]
      }]
    }]
  }
});

}
