/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";
var express = require("express");

module.exports = () => {
	var app = express.Router();

	//HANA DB Client 
	app.get("/", (req, res) => {

		let client = req.db;

		client.exec(
			`select PRODUTO, COD_ITEM, DT_INI, DT_FIN from "fethabadj.fethabadj_db.data::PRODUTO"
             order by "PRODUTO","COD_ITEM", "DT_INI"`,
			(err, result) => {
				if (err) {
					return res.type("text/plain").status(500).send(`ERROR: ${err.toString()}`);
				} else {

					let produtoarray = [];
					let idCount = 0;

					result.forEach((a) => {
						produtoarray.push({
							Id: idCount++,
							...a
						});
					});
					return res.type("application/json").status(200).send({
						produto: produtoarray
					});
				}
			}
		)

	});
	return app;
};