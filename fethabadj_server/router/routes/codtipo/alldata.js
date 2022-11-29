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
			`select ITEM_INCENTIVO, CODIGO_IRF, CAT_IMPOSTO, DT_INI, DT_FIN from "funruraladj.funruraladj_db.data::CODTIPO"
             order by "ITEM_INCENTIVO"`,
			(err, result) => {
				if (err) {
					return res.type("text/plain").status(500).send(`ERROR: ${err.toString()}`);
				} else {

					let codtipoarray = [];
					let idCount = 0;

					result.forEach((a) => {
						codtipoarray.push({
							Id: idCount++,
							...a
						});
					});
					return res.type("application/json").status(200).send({
						codtipo: codtipoarray
					});
				}
			}
		)
	});
	return app;
};