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
	app.post("/", async(req, res) => {

			const {
				product,
				item_incentivo,
				period,
				period2,
				aliquota,
				valor
			} = req.body;

			const period1f = period.slice(6) + period.slice(3, 5) + period.slice(0, 2);
			const period2f = period2.slice(6) + period2.slice(3, 5) + period2.slice(0, 2);
			let client = req.db;
			
			console.log(period,period2,period1f,period2f)

			const query_insert_taxa =
				`insert into "fethabadj.fethabadj_db.data::TAXA"(PRODUTO, ITEM_INCENTIVO, DT_INI, DT_FIN, ALIQUOTA, VALOR) values(?, ?, ?, ?, ?, ?)`;
			try {
				let taxa_inserted = await client.exec(query_insert_taxa,
					[product, item_incentivo, period1f, period2f, aliquota, valor]);
			let msg = '';
			if (taxa_inserted == 1) {
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