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
				cod_item,
				period,
				period2
			} = req.body;

			const period1f = period.slice(6) + period.slice(3, 5) + period.slice(0, 2);
			const period2f = period2.slice(6) + period2.slice(3, 5) + period2.slice(0, 2);
			let client = req.db;
			
			console.log(period,period2,period1f,period2f)

			const query_insert_produto =
				`insert into "fethabadj.fethabadj_db.data::PRODUTO"(PRODUTO, COD_ITEM, DT_INI, DT_FIN) values(?, ?, ?, ?)`;
			try {
				let produto_inserted = await client.exec(query_insert_produto,
					[product, cod_item, period1f, period2f]);
			let msg = '';
			if (produto_inserted == 1) {
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