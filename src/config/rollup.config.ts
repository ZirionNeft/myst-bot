import dts from "rollup-plugin-dts";

export default {
	input: "../Myst.d.ts",
	output: [
		{
			file: "./../Myst.d.ts",
			format: "es",
		},
	],
	plugins: [dts()],
};
