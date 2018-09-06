// setup file for jest
module.exports = {
  "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
    "testPathIgnorePatterns":["dist/.*", "__tests__/helpers"],
    "testRegex": "(/__tests__/.*|(\\.|/)test)\\.(jsx?|tsx?)$",
    "moduleFileExtensions": [
      "ts",
      "tsx",
      "js",
      "jsx",
      "json"
    ],
    "testURL":"http://localhost/",
    "setupFiles": ["<rootDir>/__tests__/helpers/setup.ts"]
};
