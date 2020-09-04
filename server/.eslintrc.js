// "extends": "airbnb-base",
module.exports = {

	plugins: [
		"import",
		"eslint-plugin",
		"jsdoc"
	],
	"extends": "airbnb-base",
	// "extends": "recommended",
	// "plugins": [
	// 	"import"
	// ],
	"parser": "babel-eslint",
	"rules": {
		// "indent": ["error", 4],
		"linebreak-style": ["error", "unix"],
		// "quotes": ["error", "double"],
		// "semi": ["error", "always"],

		// override default options for rules from base configurations
		"comma-dangle": ["error", "never"],
		"no-cond-assign": ["error", "always"],

		// disable rules from base configurations
		// "no-console": "1",

		"camelcase": ["error", { "ignoreDestructuring": true }],

		"array-bracket-spacing": ["error", "never"],
		"array-callback-return": "error",
		"arrow-body-style": ["error", "as-needed"],
		"arrow-parens": ["error", "as-needed"],
		"arrow-spacing": "error",
		"indent": ["warn", "tab"],
		// "indent": [2, 4, { "SwitchCase": 1 }],
		"block-spacing": "error",
		"brace-style": ["error", "1tbs"],
		// "camelcase": "error",
		"callback-return": ["error", ["cb", "callback", "next"]],
		"class-methods-use-this": "error",
		// "comma-dangle": "error",
		"comma-spacing": "error",
		"comma-style": ["error", "last"],
		"computed-property-spacing": "error",
		// "consistent-return": ["error", { "treatUndefinedAsUnspecified": true }],
		"curly": ["error", "all"],
		"default-case": "error",
		"default-param-last": "error",
		"dot-location": ["error", "property"],
		"dot-notation": ["error", { allowKeywords: true }],
		"eol-last": "error",
		"eqeqeq": "error",
		"func-call-spacing": "error",
		"func-style": ["error", "declaration", { "allowArrowFunctions": true }],
		"function-paren-newline": ["error", "consistent"],
		"generator-star-spacing": "error",
		"guard-for-in": "error",
		"handle-callback-err": ["error", "err"],
		// "jsdoc/check-indentation": 1,
		// "jsdoc/check-alignment": "error",
		// "jsdoc/check-param-names": "error",
		// "jsdoc/check-syntax": "error",
		// "jsdoc/check-tag-names": "error",
		// "jsdoc/check-types": "error",
		// "jsdoc/implements-on-classes": "error",
		// "jsdoc/newline-after-description": ["error", "never"],
		// "jsdoc/require-description": "error",
		// "jsdoc/require-hyphen-before-param-description": ["error", "never"],
		// "jsdoc/require-jsdoc": "error",
		// "jsdoc/require-param": "error",
		// "jsdoc/require-param-description": "error",
		// "jsdoc/require-param-name": "error",
		// "jsdoc/require-param-type": "error",
		// "jsdoc/require-returns": ["error", { forceRequireReturn: true, forceReturnsWithAsync: true }],
		// "jsdoc/require-returns-description": "error",
		// "jsdoc/require-returns-type": "error",
		"key-spacing": ["error", { beforeColon: false, afterColon: true }],
		"keyword-spacing": "error",
		"lines-around-comment": ["warn", {
			"beforeBlockComment": true,
			"afterBlockComment": false,
			"beforeLineComment": true,
			"afterLineComment": false
		}],
		"max-len": ["error", 160, {
			"ignoreComments": true,
			"ignoreUrls": true,
			"ignoreStrings": true,
			"ignoreTemplateLiterals": true,
			"ignoreRegExpLiterals": true
		}],
		"max-statements-per-line": "error",
		"new-cap": "error",
		"new-parens": "error",
		"no-alert": "error",
		"no-array-constructor": "error",
		"no-buffer-constructor": "error",
		"no-caller": "error",
		"no-confusing-arrow": "error",
		"no-console": "warn",
		"no-delete-var": "error",
		"no-else-return": ["error", { "allowElseIf": false }],
		"no-eval": "error",
		"no-extend-native": "error",
		"no-extra-bind": "error",
		"no-fallthrough": "error",
		"no-floating-decimal": "error",
		"no-global-assign": "error",
		"no-implied-eval": "error",
		"no-invalid-this": "error",
		"no-iterator": "error",
		"no-label-var": "error",
		"no-labels": "error",
		"no-lone-blocks": "error",
		"no-loop-func": "error",
		"no-mixed-requires": "error",
		"no-mixed-spaces-and-tabs": ["error", false],
		"no-multi-spaces": "error",
		"no-multi-str": "error",
		"no-multiple-empty-lines": ["error", { "max": 2, "maxBOF": 0, "maxEOF": 0 }],
		"no-nested-ternary": "error",
		"no-new": "error",
		"no-new-func": "error",
		"no-new-object": "error",
		"no-new-require": "error",
		"no-new-wrappers": "error",
		"no-octal": "error",
		"no-octal-escape": "error",
		"no-param-reassign": "error",
		"no-path-concat": "error",
		"no-process-exit": "error",
		"no-proto": "error",
		"no-redeclare": "error",
		"no-restricted-properties": [
			"error",
			{ "property": "substring", "message": "Use .slice instead of .substring." },
			{ "property": "substr", "message": "Use .slice instead of .substr." },
			{ "object": "assert", "property": "equal", "message": "Use assert.strictEqual instead of assert.equal." },
			{ "object": "assert", "property": "notEqual", "message": "Use assert.notStrictEqual instead of assert.notEqual." },
			{ "object": "assert", "property": "deepEqual", "message": "Use assert.deepStrictEqual instead of assert.deepEqual." },
			{ "object": "assert", "property": "notDeepEqual", "message": "Use assert.notDeepStrictEqual instead of assert.notDeepEqual." }
		],
		"no-return-assign": "error",
		"no-script-url": "error",
		"no-self-assign": "error",
		"no-self-compare": "error",
		"no-sequences": "error",
		"no-shadow": "error",
		"no-tabs": ["warn", { "allowIndentationTabs": true }],
		"no-throw-literal": "error",
		"no-trailing-spaces": "error",
		"no-undef": ["error", { "typeof": true }],
		"no-undef-init": "error",
		"no-undefined": "error",
		"no-unmodified-loop-condition": "error",
		"no-unneeded-ternary": "error",
		"no-unused-expressions": "error",
		"no-underscore-dangle": ["error", { "enforceInMethodNames": false, "allow": ["_id", "_CALLAPI", "_validateToken", "_constructURL"] }],
		"no-unused-vars": ["error", { "vars": "all", "args": "none", "ignoreRestSiblings": true }],
		"no-use-before-define": ["error", { "variables": false }],
		"no-useless-call": "error",
		"no-useless-computed-key": "error",
		"no-useless-concat": "error",
		"no-useless-constructor": "error",
		"no-useless-escape": "error",
		"no-useless-rename": "error",
		"no-useless-return": "error",
		"no-whitespace-before-property": "error",
		"no-var": "error",
		"object-curly-newline": ["error", { "consistent": true, "multiline": true }],
		"object-curly-spacing": ["error", "always"],
		"object-property-newline": ["error", { "allowAllPropertiesOnSameLine": true }],
		"object-shorthand": "error",
		"one-var-declaration-per-line": "error",
		"operator-assignment": "error",
		"operator-linebreak": "error",
		"padding-line-between-statements": [
			"error",
			{
				"blankLine": "always",
				"prev": ["const", "let", "var"],
				"next": "*"
			},
			{
				"blankLine": "any",
				"prev": ["const", "let", "var"],
				"next": ["const", "let", "var"]
			}
		],
		"prefer-arrow-callback": "error",
		"prefer-const": "error",
		"prefer-numeric-literals": "error",
		"prefer-promise-reject-errors": ["error", { "allowEmptyReject": true }],
		"prefer-regex-literals": "error",
		"prefer-rest-params": "error",
		"prefer-spread": "error",
		"prefer-template": "error",
		"quotes": ["error", "double", { "avoidEscape": true }],
		"quote-props": ["error", "as-needed"],
		"radix": "error",
		"require-unicode-regexp": "error",
		"rest-spread-spacing": "error",
		"semi": "error",
		"semi-spacing": ["error", { "before": false, "after": true }],
		"semi-style": "error",
		"space-before-blocks": "error",
		"space-before-function-paren": ["error", {
			"anonymous": "never",
			"named": "never",
			"asyncArrow": "always"
		}],
		"space-in-parens": "error",
		"space-infix-ops": "error",
		"space-unary-ops": ["error", { "words": true, "nonwords": false }],
		"spaced-comment": ["error", "always", { "exceptions": ["-"] }],
		"strict": ["error", "global"],
		"switch-colon-spacing": "error",
		"symbol-description": "error",
		"template-curly-spacing": ["error", "never"],
		"template-tag-spacing": "error",
		"unicode-bom": "error",
		"wrap-iife": "error",
		"yield-star-spacing": "error",
		"yoda": ["error", "never"]

	},
	"parserOptions": {
		"sourceType": "module",
		"ecmaVersion": 6,
		"ecmaFeatures": {
			"experimentalObjectRestSpread": true
		}
	}
};




// "jsdoc/check-alignment": 1, // Recommended
//         "jsdoc/check-examples": 1,
//         "jsdoc/check-indentation": 1,
//         "jsdoc/check-param-names": 1, // Recommended
//         "jsdoc/check-syntax": 1,
//         "jsdoc/check-tag-names": 1, // Recommended
//         "jsdoc/check-types": 1, // Recommended
//         "jsdoc/implements-on-classes": 1, // Recommended
//         "jsdoc/match-description": 1,
//         "jsdoc/newline-after-description": 1, // Recommended
//         "jsdoc/no-types": 1,
//         "jsdoc/no-undefined-types": 1, // Recommended
//         "jsdoc/require-description": 1,
//         "jsdoc/require-description-complete-sentence": 1,
//         "jsdoc/require-example": 1,
//         "jsdoc/require-hyphen-before-param-description": 1,
//         "jsdoc/require-jsdoc": 1, // Recommended
//         "jsdoc/require-param": 1, // Recommended
//         "jsdoc/require-param-description": 1, // Recommended
//         "jsdoc/require-param-name": 1, // Recommended
//         "jsdoc/require-param-type": 1, // Recommended
//         "jsdoc/require-returns": 1, // Recommended
//         "jsdoc/require-returns-check": 1, // Recommended
//         "jsdoc/require-returns-description": 1, // Recommended
//         "jsdoc/require-returns-type": 1, // Recommended
//         "jsdoc/valid-types": 1 // Recommended