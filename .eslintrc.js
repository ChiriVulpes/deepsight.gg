module.exports = /** @type {import("eslint").Linter.BaseConfig & import("@typescript-eslint/utils").TSESLint.Linter.Config} */ ({
	root: true,
	parser: "@typescript-eslint/parser",
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"],
	},
	ignorePatterns: [".eslintrc.js"],
	plugins: [
		"@typescript-eslint",
		"only-warn",
	],
	extends: [
		// use all recommended rules as base
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
	],
	rules: {
		// eslint
		"comma-dangle": ["warn", "always-multiline"],
		"quotes": ["warn", "double", { avoidEscape: true }],
		"no-constant-condition": ["warn", { checkLoops: false }], // allows `while (true)`
		"no-empty": ["warn", { allowEmptyCatch: true }],
		"prefer-const": ["warn", { "destructuring": "all" }],
		"no-inner-declarations": ["off"],
		"no-unexpected-multiline": ["off"], // sometimes i want to do zero indexing on a new line
		"semi": ["warn", "always"],

		// typescript-eslint
		"@typescript-eslint/no-unused-vars": ["off"], // literally just what typescript already has, no thanks
		"@typescript-eslint/no-explicit-any": ["off"], // `any` is a useful type mostly for type arguments. It should be avoided by writing good, strongly-typed code, not warned in all uses
		"@typescript-eslint/await-thenable": ["off"], // this has a warning built in to TS (the ... under the `await`)
		"@typescript-eslint/no-non-null-assertion": ["off"], // listen, type guards are waaaay not good enough to go without language features like this
		"@typescript-eslint/no-namespace": ["off"], // this is super useful to add stuff to classes and interfaces and enums and stuff
		"@typescript-eslint/explicit-module-boundary-types": ["off"], // it would be so annoying to explicitly type all the methods that return `this`
		// "@typescript-eslint/no-unsafe-member-access": ["off"],
		"@typescript-eslint/ban-types": ["off"], // there's actually a lot of useful types in here, add more restrictions back later if need be
		// "@typescript-eslint/no-misused-promises": ["warn", { "checksVoidReturn": false }], // this prevents hanging promises
		// "@typescript-eslint/unbound-method": ["warn", { "ignoreStatic": true }],
		"@typescript-eslint/unbound-method": ["off"], // we have @Bound for this purpose
		"@typescript-eslint/no-empty-interface": ["off"], // not useful
		"@typescript-eslint/no-empty-function": ["off"], // not useful
		"@typescript-eslint/no-unsafe-return": ["off"], // i want this but it yells when an any value is returned in an any, not good for chaining callback functions

		"@typescript-eslint/consistent-type-imports": ["warn"],
		"@typescript-eslint/no-unsafe-declaration-merging": ["off"],
		"@typescript-eslint/no-unsafe-enum-comparison": ["off"],
	},
});