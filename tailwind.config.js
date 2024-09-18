import { zinc, red, black, blue, transparent } from "tailwindcss/colors";
const defaultTheme = require("tailwindcss/defaultTheme");

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		colors: {
			zinc,
			red,
			black,
			blue,
			transparent,
			message: "rgb(9 9 11 / 0.65)"
		},
		extend: {
			fontFamily: {
				inter: ["Inter", ...defaultTheme.fontFamily.sans]
			},
			fontSize: {
				xss: "0.625rem"
			},
			spacing: {
				"9/10": "90%"
			}
		}
	},
	plugins: []
};
