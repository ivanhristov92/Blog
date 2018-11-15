require("@babel/register")({
  presets: ["@babel/preset-env", "@babel/preset-flow"],
  ignore: [/node_modules\/(?!redux-manager-lib)/]
});
