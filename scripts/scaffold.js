"use strict";

const scaffoldButtons = $("[data-scaffold]");
const previewButtons = $("[data-preview]");
const scaffoldModal = $("#scaffoldModal");
const finishModal = $("#finishModal");
const doScaffoldButton = $(".do-scaffold");
const nodeSassVersion = "^4.5.3";
const holderJsVersion = "^2.9.4";

const defaultPaths = {
	bootstrapCSSPath: "/dist/css/bootstrap.css",
	bootstrapJSPath: "/dist/js/bootstrap.js",
	jqueryPath: "/assets/js/vendor/jquery-slim.min.js",
	popperPath: "/assets/js/vendor/popper.min.js",
	holderPath: "/assets/js/vendor/holder.min.js"
};

const defaultPathsModules = {
	bootstrapCSSPath: "node_modules/bootstrap/dist/css/bootstrap.css",
	bootstrapJSPath: "node_modules/bootstrap/dist/js/bootstrap.js",
	jqueryPath: "node_modules/jquery/dist/jquery-slim.js",
	popperPath: "node_modules/popper.js/dist/umd/popper.js",
	holderPath: "node_modules/holderjs/holder.js"
};

scaffoldButtons.on("click", showScaffoldModal);
previewButtons.on("click", preview);
doScaffoldButton.on("click", scaffold);
finishModal.on("hidden.bs.modal", () => window.close());

function getFolderNameFromEl(el) {
	const href = el.href;
	const folderName = href.split("templates/")[1].split("/")[0];
	return folderName;
}

function showScaffoldModal(e) {
	e.preventDefault();
	const el = e.target;
	scaffoldModal.find(".template-name").val(getFolderNameFromEl(el));
	scaffoldModal.modal("show");
}

function showFinishModal() {
	scaffoldModal.modal("hide");
	finishModal.modal("show");
}

function preview(e) {
	e.preventDefault();
	const el = e.currentTarget;
	const folderName = getFolderNameFromEl(el);
	const context = Object.assign(
		{
			customCSSPath: folderName + ".css",
			customJSPath: folderName + ".js"
		},
		defaultPaths
	);
	window.open(pingy.templatedURL(el.href, context), "_blank");
}

const contains = (arr, name) => arr.filter(x => x === name).length;
const hasCustomJS = name => !!contains(["tooltip-viewport", "offcanvas"], name);
const hasCustomCSS = name => !contains(["navbar-bottom"], name);
const hasHolderJS = name => !!contains(["carousel"], name);

function scaffold() {
	const folderName = scaffoldModal.find(".template-name").val();
	const styleFormat = scaffoldModal.find(".style-select").val();

	const vars = Object.assign({}, defaultPathsModules);
	const files = [];
	const devDependencies = {};
	const dependencies = {};


	if (hasCustomJS(folderName)) {
		const output = "scripts/main.js";
		vars.customJSPath = output;
		files.push({
			input: "templates/" + folderName + "/" + folderName + ".js",
			output
		});
	}

	if (hasCustomCSS(folderName)) {
		const output = "styles/main.css";
		vars.customCSSPath = output;
		if (styleFormat === "css") {
			files.push({
				input: "templates/" + folderName + "/" + folderName + ".css",
				output
			});
		} else if (styleFormat === "scss") {
			devDependencies["node-sass"] = nodeSassVersion;
			files.push({
				input: "templates/scss/template.scss",
				includes: {
					customCSS: "templates/" + folderName + "/" + folderName + ".css"
				},
				output: "styles/main.scss"
			});
		}
	}

	files.push({
		input: "templates/" + folderName + "/" + "index" + ".html",
		output: "index.html",
		vars
	});

	if (hasHolderJS(folderName)) {
		dependencies.holderjs = holderJsVersion;
	}

	pingy.scaffold({ files, dependencies, devDependencies }).then(() => {
		showFinishModal();
		window.addEventListener("blur", () => window.close());
	});
}
