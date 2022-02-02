storybook:
	npx start-storybook

start:
	npx react-scripts start

build:
	npx react-scripts build

lint:
	echo "TODO"

publish lint build version-patch:
	npm publish

version-patch:
	npm version patch

version-minor:
	npm version minor