sap.ui.define([
	"fethabadj_ui/controllers/BaseController",
	"fethabadj_ui/myLib/oData",
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageBox",
	"fethabadj_ui/myLib/utils",
	'sap/m/MessageToast'
], function (BaseController, oData, JSONModel, MessageBox, utils, MessageToast) {
	"use strict";
	const oData2 = utils.deepClone(oData);
	return BaseController.extend("fethabadj_ui.Table", {
		onInit: function () {

			var xhttp = new XMLHttpRequest();
			var view = this;

			xhttp.open("GET", "/fethab/codtipo/alldata", true);
			xhttp.send();
			xhttp.onreadystatechange = function () {
				//	console.log(this.responseText);
				if (this.readyState === 4 && this.status === 200) {
					var response = JSON.parse(this.responseText);
					var codtipo = {
						CODTIPO: response.codtipo
					}
					var oModelCodtipo = new JSONModel(codtipo);
					view.byId('tableCodtipo').setModel(oModelCodtipo);

					var oModel = new JSONModel(oData2);
					view.byId('AddDialog2').setModel(oModel);

				} else {
					if (this.status === 401) {
						window.location.reload();
					} else if (this.readyState === 3 && this.status >= 500) {
						MessageBox.error(this.response);
					}

				}
			};

			var oModel = new JSONModel(oData2);
			this.getView().byId('AddDialog2').setModel(oModel);
		},
		save: function () {
			var viewTable = this.getView();
			var dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/;
			var view = this.getView().byId('AddDialog2');

			if (!oData2.ItemIncentivo || !oData2.CodigoIrf || !oData2.CatImposto) {
				MessageBox.warning("Campos obrigatórios sem preenchimento");
				return;
			}

			if (!oData2.SelectedPeriod.match(dateReg)) {
				MessageBox.warning("Formato de período incorreto, use o seletor para definir o período");
				return;
			}
			if (!oData2.SelectedPeriod2.match(dateReg)) {
				MessageBox.warning("Formato de período incorreto, use o seletor para definir o período");
				return;
			}

			let newdate1 = new Date(oData2.SelectedPeriod.slice(6), oData2.SelectedPeriod.slice(3, 5), oData2.SelectedPeriod.slice(0, 2));
			let newdate2 = new Date(oData2.SelectedPeriod2.slice(6), oData2.SelectedPeriod2.slice(3, 5), oData2.SelectedPeriod2.slice(0, 2))
			if (newdate1.getTime() > newdate2.getTime()) {
				MessageBox.warning("Período inicial maior que final");
				return;
			}

			var xhttp = new XMLHttpRequest();
			xhttp.open("POST", "/fethab/codtipo/add", true);
			xhttp.setRequestHeader('content-type', 'application/json');

			var content = {
				item_incentivo: oData2.ItemIncentivo,
				codigo_irf: oData2.CodigoIrf,
				cat_imposto: oData2.CatImposto,
				period: oData2.SelectedPeriod,
				period2: oData2.SelectedPeriod2
			};

			xhttp.send(JSON.stringify(content));
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status === 200) {
					var response = JSON.parse(this.responseText);

					if (response.result == 'Ok') {
						view.close();
						MessageToast.show('Adicionado com sucesso!');
						updateTable(viewTable);
					}
					console.log(response.result);
				} else {

					if (this.status === 401) {
						window.location.reload();
					} else if (this.readyState === 3 && this.status >= 500) {
						MessageBox.error(this.response);
					}

				}

			}
		},
		save2: function () {
			var viewTable = this.getView();
			var dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/;
			var view = this.getView().byId('EditDialog2');
			var data = this.getView().byId('EditDialog2').getModel().getData();

			if (!data.DT_FIN.match(dateReg)) {
				MessageBox.warning("Formato de período incorreto, use o seletor para definir o período");
				return;
			}

			let newdate1 = new Date(data.DT_INI.slice(6), data.DT_INI.slice(3, 5), data.DT_INI.slice(0, 2));
			let newdate2 = new Date(data.DT_FIN.slice(6), data.DT_FIN.slice(3, 5), data.DT_FIN.slice(0, 2))
			if (newdate1.getTime() > newdate2.getTime()) {
				MessageBox.warning("Período inicial maior que final");
				return;
			}

			var xhttp = new XMLHttpRequest();
			xhttp.open("PATCH", "/fethab/codtipo/edit", true);
			xhttp.setRequestHeader('content-type', 'application/json');

			var content = {
				item_incentivo: data.ITEM_INCENTIVO,
				codigo_irf: data.CODIGO_IRF,
				cat_imposto: data.CAT_IMPOSTO,
				period: data.DT_INI,
				period2: data.DT_FIN
			};

			xhttp.send(JSON.stringify(content));
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status === 200) {
					var response = JSON.parse(this.responseText);

					if (response.result == 'Ok') {
						view.close();
						MessageToast.show('Atualizado com sucesso!');
						updateTable(viewTable);
					}
					console.log(response.result);
				} else {

					if (this.status === 401) {
						window.location.reload();
					} else if (this.readyState === 3 && this.status >= 500) {
						MessageBox.error(this.response);
					}

				}

			}
		},
		onDelete: function (e) {
			var view = this.getView();
			var sPath = e.getSource('CODTIPO').getBindingContext();
			var oModel = this.getView().byId('tableCodtipo').getModel();
			var oRowData = oModel.getProperty(sPath.sPath);
			console.log(oRowData);
			var xhttp = new XMLHttpRequest();
			xhttp.open("DELETE", "/fethab/codtipo/delete", true);
			xhttp.setRequestHeader('content-type', 'application/json');

			var content = {
				item_incentivo: oRowData.ITEM_INCENTIVO,
				codigo_irf: oRowData.CODIGO_IRF,
				cat_imposto: oRowData.CAT_IMPOSTO,
				period: oRowData.DT_INI,
			};
			xhttp.send(JSON.stringify(content));
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status === 200) {
					var response = JSON.parse(this.responseText);

					if (response.result == 'Ok') {
						MessageToast.show('Removido com sucesso!');
						updateTable(view);

					}
				}
			}
		},
		add: function () {
			var month = (new Date().getMonth() + 1).toString();
			var year = (new Date().getFullYear()).toString();

			if (month.length < 2) {
				month = '0' + month;
			}
			var date = '01' + '/' + month + '/' + year;
			var date2 = '01' + '/' + month + '/' + year;

			oData2.SelectedPeriod = date;
			oData2.SelectedPeriod2 = date2;

			var oModel = new JSONModel(oData2);
			this.getView().byId('AddDialog2').setModel(oModel);

			var oDialog = this.byId("AddDialog2");
			oDialog.open();
		},
		onEdit: function (e) {
			var view = this.getView();
			var sPath = e.getSource('CODTIPO').getBindingContext();
			var oModel = this.getView().byId('tableCodtipo').getModel();
			var oRowData = oModel.getProperty(sPath.sPath);
			//	console.log(oRowData.DT_INI,oRowData.DT_FIN);
			var date1 = oRowData.DT_INI.slice(6) + '/' + oRowData.DT_INI.slice(4, 6) + '/' + oRowData.DT_INI.slice(0, 4);
			var date2 = oRowData.DT_FIN.slice(6) + '/' + oRowData.DT_FIN.slice(4, 6) + '/' + oRowData.DT_FIN.slice(0, 4);
			var obj = {
				ITEM_INCENTIVO: oRowData.ITEM_INCENTIVO,
				CODIGO_IRF: oRowData.CODIGO_IRF,
				CAT_IMPOSTO: oRowData.CAT_IMPOSTO,
				DT_INI: date1,
				DT_FIN: date2
			}

			var oModel = new JSONModel(obj);
			this.getView().byId('EditDialog2').setModel(oModel);

			var oDialog = this.byId("EditDialog2");
			oDialog.open();
		},
		onClose: function () {
			var oDialog = this.byId("AddDialog2");
			oDialog.close();
		},
		onClose2: function () {
			var oDialog = this.byId("EditDialog2");
			oDialog.close();
		}

	});

	function updateTable(view) {
		var xhttp = new XMLHttpRequest();
		xhttp.open("GET", "/fethab/codtipo/alldata", true);
		xhttp.send();
		xhttp.onreadystatechange = function () {
			//console.log(this.responseText);
			if (this.readyState === 4 && this.status === 200) {
				var response = JSON.parse(this.responseText);
				var codtipo = {
					CODTIPO: response.codtipo
				}
				var oModelCodtipo = new JSONModel(codtipo);
				view.byId('tableCodtipo').setModel(oModelCodtipo);

				//console.log(response.result);
			} else {

				if (this.status === 401) {
					window.location.reload();
				} else if (this.readyState === 3 && this.status >= 500) {
					MessageBox.error(this.response);
				}
			}

		}
	}
});