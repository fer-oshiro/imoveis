export default {
  'packages/**/*.{ts,tsx,js,jsx,mjs,cjs}': ['prettier -w --ignore-unknown'],
  '*.{json,md,yml,yaml,css,scss,html}': ['prettier -w --ignore-unknown'],
}
