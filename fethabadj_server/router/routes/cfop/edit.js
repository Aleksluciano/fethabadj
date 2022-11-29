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
				cfop,
				period,
				period2
		} = req.body;
		
		const period1f = period.slice(6) + period.slice(3, 5) + period.slice(0, 2);
		const period2f = period2.slice(6) + period2.slice(3, 5) + period2.slice(0, 2);
		let client = req.db;

		const query_edit_cfop =
			`UPDATE "fethabadj.fethabadj_db.data::CFOP" SET DT_FIN = ?
				where CFOP = ? AND DT_INI = ?`;
		try {
			let cfop_edited = await client.exec(query_edit_cfop, [period2f, cfop, period1f]);
			let msg = '';
			console.log(cfop_edited);
			if (cfop_edited == 1) {
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