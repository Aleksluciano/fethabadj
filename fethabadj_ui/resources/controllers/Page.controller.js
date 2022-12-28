sap.ui.define([
	"fethabadj_ui/controllers/BaseController",
	'sap/ui/model/json/JSONModel',
	'fethabadj_ui/myLib/oData',
	'fethabadj_ui/myLib/utils',
	'sap/m/MessageToast',
	"sap/m/MessageBox",
	"sap/ui/export/Spreadsheet",
	"sap/ui/core/format/NumberFormat"
], function (BaseController, JSONModel, oData, utils, MessageToast, MessageBox, Spreadsheet, NumberFormat) {
	"use strict";
	var planilha1 = [];
	var planilha2 = [];
	var metadata = "";
	return BaseController.extend("fethabadj_ui.controllers.Page", {
		onVigencia: function () {
			this.getRouter().navTo("appVigencia");
		},
		onTaxas: function () {
			this.getRouter().navTo("appTaxas");
		},
		onCfop: function () {
			this.getRouter().navTo("appCfop");
		},
		onProd: function () {
			this.getRouter().navTo("appProduto");
		},
		onExcel1: function () {
			this._onDataExport(planilha1, 1);
		},
		onExcel2: function () {
			this._onDataExport(planilha2, 2);
		},
		_onDataExport: function (result, planilha_numero) {
			var oExportConfiguration, oExportPromise, oSpreadsheet;

			oExportConfiguration = this._createExportConfiguration(result, planilha_numero);
			oSpreadsheet = new Spreadsheet(oExportConfiguration);

			/* Starts the export and returns a Promise */
			oExportPromise = oSpreadsheet.build();

			oExportPromise.then(function () {
				// Here you can perform additional steps after the export has finished
			});
		},
		_createExportConfiguration: function (result, planilha_numero) {
			const oFormatOptions6 = {
				groupingSeparator: ',',
				decimalSeparator: '.',
				minFractionDigits: 6,
				maxFractionDigits: 6
			};
			const oFormatOptions4 = {
				groupingSeparator: ',',
				decimalSeparator: '.',
				minFractionDigits: 4,
				maxFractionDigits: 4
			};
			const oFormatOptions2 = {
				groupingSeparator: ',',
				decimalSeparator: '.',
				minFractionDigits: 2,
				maxFractionDigits: 2
			};
			let oFloatFormat6 = NumberFormat.getFloatInstance(oFormatOptions6);
			let oFloatFormat4 = NumberFormat.getFloatInstance(oFormatOptions4);
			let oFloatFormat2 = NumberFormat.getFloatInstance(oFormatOptions2);

			if (planilha_numero == 1) {
				const resultFinal = result.map(a => {
					let b = Object.assign({}, a);
					b.QTD = oFloatFormat6.format(a.QTD);
					b.CA_VL_UNID = oFloatFormat6.format(a.CA_VL_UNID);
					b.VL_ITEM = oFloatFormat2.format(a.VL_ITEM);
					return b;
				});

				var oConfiguration = {
					fileName: "FET_DETALHE_" + metadata,
					workbook: {

						columns: [{
								property: "EMPRESA",
								label: "Empresa",
								width: 15
							}, {
								property: "FILIAL",
								label: "Filial",
								width: 15
							}, {
								property: "NF_ID",
								label: "ID Nota Fiscal",
								width: 15
							}, {
								property: "NUM_DOC",
								label: "Nº do documento fiscal",
								width: 15
							}, {
								property: "SER",
								label: "Série do documento fiscalF",
								width: 15
							}, {
								property: "DT_DOC",
								label: "Data do documento",
								width: 15
							}, {
								property: "DT_E_S",
								label: "Data entrada/saída de mercadorias",
								width: 15
							}, {
								property: "DIRECT",
								label: "1 Entrada / 2 Saída",
								width: 15
							}, {
								property: "COD_PART",
								label: "Código de participante.",
								width: 15
							}, {
								property: "CA_CNPJ_CPF",
								label: "CNPJ ou CPF",
								width: 15
							}, {
								property: "NOME",
								label: "Nome",
								width: 15
							}, {
								property: "CFOP",
								label: "Código CFOP",
								width: 15
							}, {
								property: "COD_ITEM",
								label: "Código de item",
								width: 15
							}, {
								property: "DESCR_COMPL",
								label: "Descrição",
								width: 15
							}, {
								property: "QTD",
								label: "Quantidade",
								width: 15
							}, {
								property: "UNID",
								label: "Unidade de medida básica",
								width: 15
							}, {
								property: "CA_VL_UNID",
								label: "Valor do item",
								width: 15
							}, {
								property: "VL_ITEM",
								label: "Valor Total do Item",
								width: 15
							}

						]

					},
					dataSource: resultFinal
				};
			} else {
				const resultFinal = result.map(a => {
					let b = Object.assign({}, a);
					b.BASE_CALC = oFloatFormat6.format(a.BASE_CALC);
					b.ALIQUOTA = oFloatFormat4.format(a.ALIQUOTA);
					b.VL_UPF = oFloatFormat2.format(a.VL_UPF);
					b.VL_FETHAB = oFloatFormat2.format(a.VL_FETHAB);
					return b;
				});
				oConfiguration = {
					fileName: "FET_RESUMO_" + metadata,
					workbook: {

						columns: [{
							property: "DIRECT",
							label: "1 Entrada / 2 Saída",
							width: 15
						}, {
							property: "ITEM_INCENTIVO",
							label: "Item Incentivos Fiscais",
							width: 15
						}, {
							property: "BASE_CALC",
							label: "Base de Cálculo",
							width: 15
						}, {
							property: "ALIQUOTA",
							label: "Alíquota",
							width: 15
						}, {
							property: "VL_UPF",
							label: "Valor UPF/MT",
							width: 15
						}, {
							property: "VL_FETHAB",
							label: "Valor FETHAB",
							width: 15
						}]
					},
					dataSource: resultFinal
				};
			}

			return oConfiguration;
		},
		onPress: function () {
			planilha1 = [];
			planilha2 = [];
			var bt1 = this.getView().byId('BtnExcel1');
			var bt2 = this.getView().byId('BtnExcel2');
			bt1.setEnabled(false);
			bt2.setEnabled(false);
			var dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/;
			var view = this.getView();
			if (oData.SelectedCompany == 0 || oData.SelectedBranch == 0 || oData.SelectedEntsai == 0 || oData.SelectedProduct == "") {
				MessageBox.warning("Campo obrigatório sem preenchimento ou inválido");
				return;
			}

			if (!oData.SelectedPeriod.match(dateReg)) {
				MessageBox.warning("Formato de período incorreto, use o seletor para definir o período");
				return;
			}
			oData.Results = [];
			var oModel = new JSONModel(oData);
			view.setModel(oModel);

			var oDialog = this.byId("BusyDialog");
			oDialog.open();

			var company = utils.find(oData.SelectedCompany, oData.CompanyCollection);
			var branch = utils.find(oData.SelectedBranch, oData.BranchCollection);
			var direct = oData.SelectedEntsai;

			var xhttp = new XMLHttpRequest();
			xhttp.open("POST", "/fethab/change", true);
			xhttp.setRequestHeader('content-type', 'application/json');

			var content = {
				product: oData.SelectedProduct,
				company: company,
				branch: branch,
				period: oData.SelectedPeriod,
				direct: direct
			};
			xhttp.send(JSON.stringify(content));
			var msg = '';
			xhttp.onreadystatechange = function () {
				if (this.readyState === 4 && this.status === 200) {
					var response = JSON.parse(this.responseText);
					oDialog.close();
					//console.log(response.result, response.resultSum);

					if (response.result.length > 0) {
						msg = 'Processado com sucesso!!';
					} else {
						msg = 'Nenhum registro encontrado';
					}

					var alv1 = {
						ALV1: response.result
					};
					var oModelAlv1 = new JSONModel(alv1);
					view.byId('tableAlv1').setModel(oModelAlv1);

					var alv2 = {
						ALV2: Object.values(response.resultSum)
					};
					var oModelAlv2 = new JSONModel(alv2);
					view.byId('tableAlv2').setModel(oModelAlv2);

					MessageToast.show(msg);
					planilha1 = response.result;
					planilha2 = Object.values(response.resultSum);
					metadata = content.company + '_' + content.branch + '_' + content.period.slice(3, 5) + content.period.slice(6);
					if (planilha1 && planilha1.length > 0) bt1.setEnabled(true);
					if (planilha2 && planilha2.length > 0) bt2.setEnabled(true);
				} else {
					oDialog.close();
					if (this.status === 401) {
						window.location.reload();
					} else if (this.readyState === 3 && this.status >= 500) {
						MessageBox.error(this.response);
					}
				}
			};

		},

		changeCompany: function () {
			var allData = this.getView().getModel().getData();

			oData.SelectedBranch = 0;
			oData.BranchCollection = [];

			oData.BranchCollection = allData.Branchs.filter(function (a) {
				if (a.IdCompany == oData.SelectedCompany || a.Id == 0) {
					return true;
				} else {
					return false;
				}
			});

		}

	});

});