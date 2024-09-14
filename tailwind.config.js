import { zinc, white, black } from "tailwindcss/colors";
const defaultTheme = require("tailwindcss/defaultTheme");

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		colors: {
			zinc,
			white,
			black
		},
		extend: {
			fontFamily: {
				inter: ["Inter", ...defaultTheme.fontFamily.sans]
			},
			fontSize: {
				xss: "0.625rem"
			},
			spacing: {
				12.5: "3.125rem" /* 50px */,
				25: "6.25rem" /* 100px */,
				50: "12.50rem" /* 200px */,
				75: "18.75rem" /* 300px */,
				100: "25rem" /* 400px */,
				125: "31.25rem" /* 500px */,
				150: "37.5rem" /* 600px */,
				"9/10": "90%"
			}
		}
	},
	plugins: []
};
