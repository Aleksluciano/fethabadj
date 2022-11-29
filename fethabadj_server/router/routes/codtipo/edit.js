/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";
var express = require("express");

function pad(n) {
	return n < 10 ? '0' + n : n;
}

module.exports = () => {
	var app = express.Router();

	//HANA DB Client 
	app.patch("/", async(req, res) => {

		const {
			item_incentivo,
			codigo_irf,
			cat_imposto,
			period,
			period2
		} = req.body;

		const period1f = period.slice(6) + period.slice(3, 5) + period.slice(0, 2);
		const period2f = period2.slice(6) + period2.slice(3, 5) + period2.slice(0, 2);
		let client = req.db;

		const query_edit_codtipo =
			`UPDATE "funruraladj.funruraladj_db.data::CODTIPO" SET DT_FIN = ?
				where ITEM_INCENTIVO = ? AND CODIGO_IRF = ? AND CAT_IMPOSTO = ? AND DT_INI = ?`;
		try {
			let codtipo_edited = await client.exec(query_edit_codtipo, [period2f, item_incentivo, codigo_irf, cat_imposto, period1f]);
			let msg = '';
			console.log(codtipo_edited);
			if (codtipo_edited == 1) {
				msg = 'Ok'
			} else {
				msg = 'Error'
			}
			return res.type("application/json").status(200).send({
				result: msg
			});
		} catch (err) {
			console.log(err)
			return res.type("text/plain").status(500).send(`ERROR: code${err.code} message:${err.message}`);
		}

	});

	return app;
};