/*eslint no-console: 0, no-unused-vars: 0, no-undef:0, no-process-exit:0*/
/*eslint-env node, es6 */
"use strict";

module.exports = (app, server) => {
	app.use("/node", require("./routes/myNode")());
	app.use("/data", require("./routes/myData")());
	app.use("/change", require("./routes/myChange")());
	app.use("/vigencia/add", require("./routes/vigencia/add")());
	app.use("/vigencia/alldata", require("./routes/vigencia/alldata")());
	app.use("/vigencia/delete", require("./routes/vigencia/delete")());
	app.use("/vigencia/edit", require("./routes/vigencia/edit")());
	app.use("/taxas/add", require("./routes/taxas/add")());
	app.use("/taxas/alldata", require("./routes/taxas/alldata")());
	app.use("/taxas/delete", require("./routes/taxas/delete")());
	app.use("/taxas/edit", require("./routes/taxas/edit")());
	app.use("/produto/add", require("./routes/produto/add")());
	app.use("/produto/alldata", require("./routes/produto/alldata")());
	app.use("/produto/delete", require("./routes/produto/delete")());
	app.use("/produto/edit", require("./routes/produto/edit")());
	app.use("/cfop/add", require("./routes/cfop/add")());
	app.use("/cfop/alldata", require("./routes/cfop/alldata")());
	app.use("/cfop/delete", require("./routes/cfop/delete")());
	app.use("/cfop/edit", require("./routes/cfop/edit")());
	app.use((err, req, res, next) => {
		console.error(JSON.stringify(err));
		res.status(500).send(`System Error ${JSON.stringify(err)}`);
	});

};