// setup file for jest
module.exports = {
  "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
    "testPathIgnorePatterns":["dist/.*"],
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    "moduleFileExtensions": [
      "ts",
      "tsx",
      "js",
      "jsx",
      "json"
    ],
    "testURL":"http://localhost/",
};
