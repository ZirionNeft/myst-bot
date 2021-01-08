import dts from "rollup-plugin-dts";

export default {
	input: "../index.d.ts",
	output: [
		{
			file: "./../index.d.ts",
			format: "es",
		},
	],
	plugins: [dts()],
};
