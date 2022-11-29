sap.ui.define([
	"fethabadj_ui/controllers/BaseController",
	"fethabadj_ui/myLib/oData",
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageBox",
	"fethabadj_ui/myLib/utils",
	'sap/m/MessageToast',
	'sap/ui/core/format/NumberFormat'
], function (BaseController, oData, JSONModel, MessageBox, utils, MessageToast, NumberFormat) {
	"use strict";
	const oData2 = utils.deepClone(oData);
	return BaseController.extend("fethabadj_ui.controllers.Taxas", {
		onInit: function () {

			var xhttp = new XMLHttpRequest();
			var view = this;

			xhttp.open("GET", "/fethab/taxas/alldata", true);
			xhttp.send();
			xhttp.onreadystatechange = function () {
				//	console.log(this.responseText);
				if (this.readyState === 4 && this.status === 200) {
					var response = JSON.parse(this.responseText);
					formatNumbersFromDB(response);

					var taxas = {
						TAXASS: response.taxa
					};
					var oModelTaxas = new JSONModel(taxas);
					view.byId('tableTaxas').setModel(oModelTaxas);

					var oModel = new JSONModel(oData2);
					view.byId('TaxasAddDialog').setModel(oModel);

				} else {
					if (this.status === 401) {
						window.location.reload();
					} else if (this.readyState === 3 && this.status >= 500) {
						MessageBox.error(this.response);
					}

				}
			};

			var oModel = new JSONModel(oData2);
			this.getView().byId('TaxasAddDialog').setModel(oModel);
		},
		/*	onLiveChangeAliquota(oEvent) {
				const oFormatOptions = {
					minFractionDigits: 4,
					maxFractionDigits: 4
				};
				let oFloatFormat = NumberFormat.getFloatInstance(oFormatOptions);
				let newValue = oFloatFormat.format(oEvent.getParameter('value'));
				oEvent.getSource().setValue(newValue);	

			
			},*/
		changeCompany: function () {
			var allData = this.getView().byId('TaxasAddDialog').getModel().getData();

			oData2.SelectedBranch = 0;
			oData2.BranchCollection = [];

			oData2.BranchCollection = allData.Branchs.filter(function (a) {
				if (a.IdCompany == oData2.SelectedCompany || a.Id == 0) {
					return true;
				} else {
					return false;
				}
			});

		},
		onInputLiveChange: function (oEvt) {
			var oControl = oEvt.getSource();
			this.validateFloatInput(oControl,2);
		},
		onInputChange: function (oEvent) {
			var oControl = oEvent.getSource();
			this.validateFloatInput(oControl,2);
		},
				onInputLiveChangeAliq: function (oEvt) {
			var oControl = oEvt.getSource();
			this.validateFloatInput(oControl,4);
		},
		onInputChangeAliq: function (oEvent) {
			var oControl = oEvent.getSource();
			this.validateFloatInput(oControl,4);
		},
		checkFormatNumber(value, decimals = 0) {
			const oFormatOptions = {
				minFractionDigits: decimals,
				maxFractionDigits: decimals
			};
			let oFloatFormat = NumberFormat.getFloatInstance(oFormatOptions);
			value = value.replaceAll('.', '');
			let newValue = oFloatFormat.format(value.replace(',', '.'));
			return value === newValue.replaceAll('.', '');
		},
	
		validateFloatInput: function (oControl, decimals = 0) {
			var oBinding = oControl.getBinding("value");
			var oValue = oControl.getValue();
			try {

				const isValid = this.checkFormatNumber(oValue, decimals);

				if (isValid) {
					oControl.setValueState(sap.ui.core.ValueState.None);
					return true;
				} else {
					oControl.setValueState(sap.ui.core.ValueState.Error);
					return false;
				}
			} catch (ex) {
				oControl.setValueState(sap.ui.core.ValueState.Error);
				return false;
			}
		},
		save: function () {
			var viewTable = this.getView();
			var dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/;
			var view = this.getView().byId('TaxasAddDialog');

			if (oData2.SelectedProduct == "" || oData2.ItemIncentivo == "" ||
				!this.checkFormatNumber(oData2.Aliquota, 4) || !this.checkFormatNumber(oData2.Valor,2)) {
				MessageBox.warning("Campo obrigatório sem preenchimento ou inválido");
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

			let newdate1 = new Date(oData2.SelectedPeriod.slice(6), oData2.SelectedPeriod.slice(3, 5) - 1, oData2.SelectedPeriod.slice(0, 2));
			let newdate2 = new Date(oData2.SelectedPeriod2.slice(6), oData2.SelectedPeriod2.slice(3, 5) - 1, oData2.SelectedPeriod2.slice(0, 2));
			if (newdate1.getTime() > newdate2.getTime()) {
				MessageBox.warning("Período inicial maior que final");
				return;
			}

			var xhttp = new XMLHttpRequest();
			xhttp.open("POST", "/fethab/taxas/add", true);
			xhttp.setRequestHeader('content-type', 'application/json');

			let Aliquota = oData2.Aliquota.replaceAll('.', '');
			Aliquota = Aliquota.replace(',', '.');
			let Valor = oData2.Valor.replaceAll('.', '');
			Valor = Valor.replace(',', '.');
			var content = {
				product: oData2.SelectedProduct,
				item_incentivo: oData2.ItemIncentivo,
				aliquota: Aliquota,
				valor: Valor,
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

			};
		},
		save2: function () {
			var viewTable = this.getView();
			var dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/;
			var view = this.getView().byId('TaxasEditDialog');
			var data = this.getView().byId('TaxasEditDialog').getModel().getData();

			if (!data.SelectedPeriod2.match(dateReg)) {
				MessageBox.warning("Formato de período incorreto, use o seletor para definir o período");
				return;
			}

			let newdate1 = new Date(data.SelectedPeriod.slice(6), data.SelectedPeriod.slice(3, 5) - 1, data.SelectedPeriod.slice(0, 2));
			let newdate2 = new Date(data.SelectedPeriod2.slice(6), data.SelectedPeriod2.slice(3, 5) - 1, data.SelectedPeriod2.slice(0, 2));
			if (newdate1.getTime() > newdate2.getTime()) {
				MessageBox.warning("Período inicial maior que final");
				return;
			}

			var xhttp = new XMLHttpRequest();
			xhttp.open("PATCH", "/fethab/taxas/edit", true);
			xhttp.setRequestHeader('content-type', 'application/json');

			let Aliquota = data.Aliquota.replaceAll('.', '');
			Aliquota = Aliquota.replace(',', '.');
			let Valor = data.Valor.replaceAll('.', '');
			Valor = Valor.replace(',', '.');
			var content = {
				product: data.SelectedProduct,
				item_incentivo: data.ItemIncentivo,
				aliquota: Aliquota,
				valor: Valor,
				period: data.SelectedPeriod,
				period2: data.SelectedPeriod2
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

			};
		},
		onDelete: function (e) {
			var view = this.getView();
			var sPath = e.getSource('TAXASS').getBindingContext();
			var oModel = this.getView().byId('tableTaxas').getModel();
			var oRowData = oModel.getProperty(sPath.sPath);
			console.log(oRowData);
			var xhttp = new XMLHttpRequest();
			xhttp.open("DELETE", "/fethab/taxas/delete", true);
			xhttp.setRequestHeader('content-type', 'application/json');

			var content = {
				product: oRowData.PRODUTO,
				item_incentivo: oRowData.ITEM_INCENTIVO,
				period: oRowData.DT_INI
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
			};
		},
		add: function () {
			var month = (new Date().getMonth() + 1).toString();
			var year = (new Date().getFullYear()).toString();

			if (month.length < 2) {
				month = '0' + month;
			}
			var date = '01' + '/' + month + '/' + year;
			var date2 = '01' + '/' + month + '/' + year;

			oData2.NfidValue = "";
			oData2.SelectedCompany = 0;
			oData2.SelectedBranch = 0;
			oData2.SelectedPeriod = date;
			oData2.SelectedPeriod2 = date2;
			oData2.SelectedRegra = 0;
			oData2.SelectedProduct = "";
			oData2.Aliquota = "0,0000";
			oData2.Valor = "0,00";

			var oModel = new JSONModel(oData2);
			this.getView().byId('TaxasAddDialog').setModel(oModel);

			var oDialog = this.byId("TaxasAddDialog");
			oDialog.open();
		},
		onEdit: function (e) {
			var view = this.getView();
			var sPath = e.getSource('TAXASS').getBindingContext();
			var oModel = this.getView().byId('tableTaxas').getModel();
			var oRowData = oModel.getProperty(sPath.sPath);
			//	console.log(oRowData.DT_INI,oRowData.DT_FIN);
			var date1 = oRowData.DT_INI.slice(6) + '/' + oRowData.DT_INI.slice(4, 6) + '/' + oRowData.DT_INI.slice(0, 4);
			var date2 = oRowData.DT_FIN.slice(6) + '/' + oRowData.DT_FIN.slice(4, 6) + '/' + oRowData.DT_FIN.slice(0, 4);

			var aliq = oRowData.ALIQUOTA.substring(0, oRowData.ALIQUOTA.length);
			var obj = {
				ItemIncentivo: oRowData.ITEM_INCENTIVO,
				Aliquota: aliq,
				Valor: oRowData.VALOR,
				SelectedPeriod: date1,
				SelectedPeriod2: date2,
				SelectedProduct: oRowData.PRODUTO,
				ProductCollection: oData2.ProductCollection
			};

			let oModel1 = new JSONModel(obj);
			this.getView().byId('TaxasEditDialog').setModel(oModel1);

			var oDialog = this.byId("TaxasEditDialog");
			oDialog.open();
		},
		onClose: function () {
			var oDialog = this.byId("TaxasAddDialog");
			oDialog.close();
		},
		onClose2: function () {
			var oDialog = this.byId("TaxasEditDialog");
			oDialog.close();
		}

	});

	function formatNumbersFromDB(response) {
		if (response && response.taxa.length > 0) {
			for (const t of response.taxa) {
				t.ALIQUOTA = t.ALIQUOTA.replace('.', ',');
				t.VALOR = t.VALOR.replace('.', ',');
			}

		}
	}

	function updateTable(view) {
		var xhttp = new XMLHttpRequest();
		xhttp.open("GET", "/fethab/taxas/alldata", true);
		xhttp.send();
		xhttp.onreadystatechange = function () {
			//console.log(this.responseText);
			if (this.readyState === 4 && this.status === 200) {
				var response = JSON.parse(this.responseText);
				formatNumbersFromDB(response);
				var taxas = {
					TAXASS: response.taxa
				};
				var oModelTaxas = new JSONModel(taxas);
				view.byId('tableTaxas').setModel(oModelTaxas);

				//console.log(response.result);
			} else {

				if (this.status === 401) {
					window.location.reload();
				} else if (this.readyState === 3 && this.status >= 500) {
					MessageBox.error(this.response);
				}
			}

		};
	}
});