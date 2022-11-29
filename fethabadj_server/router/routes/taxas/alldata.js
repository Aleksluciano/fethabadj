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
			`select PRODUTO, ITEM_INCENTIVO, DT_INI, DT_FIN, ALIQUOTA, VALOR from "fethabadj.fethabadj_db.data::TAXA"
             order by "PRODUTO","ITEM_INCENTIVO", "DT_INI"`,
			(err, result) => {
				if (err) {
					return res.type("text/plain").status(500).send(`ERROR: ${err.toString()}`);
				} else {

					let taxaarray = [];
					let idCount = 0;

					result.forEach((a) => {
						taxaarray.push({
							Id: idCount++,
							...a
						});
					});
					return res.type("application/json").status(200).send({
						taxa: taxaarray
					});
				}
			}
		)

	});
	return app;
};