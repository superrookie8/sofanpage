module.exports = {
	presets: ["next/babel"],
	plugins: [
		// @locator/babel-jsx는 hydration 에러를 일으키므로 제거
	],
};
