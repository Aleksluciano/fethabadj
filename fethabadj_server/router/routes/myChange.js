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
			company,
			branch,
			period,
			direct
		} = req.body;
		const period1 = period.slice(6) + period.slice(3, 5) + '01';
		const newdate = new Date(period.slice(6), parseFloat(period.slice(3, 5)) + 1, 0);
		const period2 = period.slice(6) + period.slice(3, 5) + newdate.getDate().toString();

		//validações
		if (!company) return res.type("text/plain").status(500).send(`ERROR: Filtro de empresa faltando`);
		if (!branch) return res.type("text/plain").status(500).send(`ERROR: Filtro de filial faltando`);
		if (period1.slice(4, 6) !== period2.slice(4, 6)) return res.type("text/plain").status(500).send(
			`ERROR: Filtro de data maior que um mês`);
		if (!direct || direct > 3) return res.type("text/plain").status(500).send(`ERROR: Filtro de entrada e saída incorreto`);

		let client = req.db;

		//QUERIES
		const query_select_v_emp_fed = `select "MANDT_TDF" from "adejo.view::/TMF/V_EMP_FED" WHERE EMPRESA = ? AND EH_MATRIZ = 'X'`;
		const query_select_vigencia_regra =
			`select "EMPRESA", "FILIAL", "DT_INI", "DT_FIN", "REGRA" from "fethabadj.fethabadj_db.data::VIGENCIA" 
		where EMPRESA = ? AND FILIAL = ? AND DT_INI <= ? AND DT_FIN >= ?`;
		const query_select_taxa =
			`select "PRODUTO", "ITEM_INCENTIVO", "DT_INI", "DT_FIN", "ALIQUOTA", "VALOR" from "fethabadj.fethabadj_db.data::TAXA" 
		where PRODUTO = ? AND DT_INI <= ? AND DT_FIN >= ?`;
		//SQL EXEC
		const resultAll = [];
		let item = 0;

		try {
			let v_vigencia_table = await client.exec(query_select_vigencia_regra, [company, branch, period1, period2]);
			let v_taxa_table = await client.exec(query_select_taxa, [product, period1, period2]);
			let v_emp_fed_table = await client.exec(query_select_v_emp_fed, [company]);
			const query_select_fethab =
				`SELECT *
FROM "CV_FETHAB"
	(placeholder."$$P_EMP$$"=> '${company}', 
	placeholder."$$P_FILIAL$$"=> '${branch}', 
	placeholder."$$P_DT_INI$$"=> '${period1}', 
	placeholder."$$P_DT_FIN$$"=> '${period2}', 
	placeholder."$$P_DIRECT$$"=> '${direct}', 
	placeholder."$$P_PRODUTO$$"=> '${product}', 
	placeholder."$$P_MANDT_TDF$$"=> '${v_emp_fed_table[0].MANDT_TDF}')`;

			console.log(query_select_fethab);
			let v_fethab_table = await client.exec(query_select_fethab);
			console.log(v_fethab_table);

			let vl_qtd_total = 0;
			console.log(v_vigencia_table);
			let regra = v_vigencia_table.length > 0 ? v_vigencia_table[0].REGRA : "";
			for (const v_fethab of v_fethab_table) {
                v_fethab.CA_VL_UNID = parseFloat(v_fethab.CA_VL_UNID).toFixed(6);
				if (direct == '3') {

					if (regra == '1') {
						if (v_fethab.DIRECT == '1') {
							vl_qtd_total = parseFloat(vl_qtd_total) - parseFloat(v_fethab.QTD);
							v_fethab.VL_ITEM = parseFloat(v_fethab.VL_ITEM) * (-1);
							v_fethab.QTD = parseFloat(v_fethab.QTD) * (-1);

						} else {
							vl_qtd_total = parseFloat(vl_qtd_total) + parseFloat(v_fethab.QTD);
						}
					}

					if (regra == '2') {
						if (v_fethab.DIRECT == '2') {
							vl_qtd_total = parseFloat(vl_qtd_total) - parseFloat(v_fethab.QTD);
							v_fethab.VL_ITEM = parseFloat(v_fethab.VL_ITEM) * (-1);
							v_fethab.QTD = parseFloat(v_fethab.QTD) * (-1);
						} else {
							vl_qtd_total = parseFloat(vl_qtd_total) + parseFloat(v_fethab.QTD);
						}
					}

				} else {
					vl_qtd_total = parseFloat(vl_qtd_total) + parseFloat(v_fethab.QTD);
				}

				item++;
				resultAll.push({... {
						item
					},
					...v_fethab
				});

			}

			const resultSum = [];
			const line = {
				DIRECT: '',
				ITEM_INCENTIVO: '',
				BASE_CALC: 0,
				ALIQUOTA: 0,
				VL_UPF: 0,
				VL_FETHAB: 0
			}

			const qtd = parseFloat(vl_qtd_total) / 1000;

			for (const v_taxa of v_taxa_table) {
				line.DIRECT = direct;
				line.ITEM_INCENTIVO = v_taxa.ITEM_INCENTIVO;
				line.BASE_CALC = parseFloat(qtd).toFixed(6);
				line.ALIQUOTA = v_taxa.ALIQUOTA;
				line.VL_UPF = v_taxa.VALOR;

				if (qtd > 0) {
					line.VL_FETHAB = parseFloat(((v_taxa.VALOR * v_taxa.ALIQUOTA) / 100) * parseFloat(qtd)).toFixed(6);
				}

				resultSum.push(line);
			}

			return res.type("application/json").status(200).send({
				result: resultAll,
				resultSum: resultSum
			});

		} catch (err) {
			console.log(err)
			return res.type("text/plain").status(500).send(`ERROR: code: ${err.code} message: ${err.message}`);
		}
	});

	return app;
};