const parentConfig = require("../.eslintrc.js");

module.exports = /** @type {import("eslint").Linter.BaseConfig & import("@typescript-eslint/utils").TSESLint.Linter.Config} */ ({
	...parentConfig,
	env: {
		browser: true,
	},
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"],
	},
});
