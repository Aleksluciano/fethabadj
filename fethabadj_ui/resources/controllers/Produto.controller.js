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
	return BaseController.extend("fethabadj_ui.controllers.Produto", {
		onInit: function () {

			var xhttp = new XMLHttpRequest();
			var view = this;

			xhttp.open("GET", "/fethab/produto/alldata", true);
			xhttp.send();
			xhttp.onreadystatechange = function () {
				//	console.log(this.responseText);
				if (this.readyState === 4 && this.status === 200) {
					var response = JSON.parse(this.responseText);

					var produto = {
						PRODUTO: response.produto
					};
					var oModelProduto = new JSONModel(produto);
					view.byId('tableProduto').setModel(oModelProduto);

					var oModel = new JSONModel(oData2);
					view.byId('ProdutoAddDialog').setModel(oModel);

				} else {
					if (this.status === 401) {
						window.location.reload();
					} else if (this.readyState === 3 && this.status >= 500) {
						MessageBox.error(this.response);
					}

				}
			};

			var oModel = new JSONModel(oData2);
			this.getView().byId('ProdutoAddDialog').setModel(oModel);
		},
		save: function () {
			var viewTable = this.getView();
			var dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/;
			var view = this.getView().byId('ProdutoAddDialog');

			if (oData2.SelectedProduct == "" || oData2.CodItem == "") {
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

			let newdate1 = new Date(oData2.SelectedPeriod.slice(6), oData2.SelectedPeriod.slice(3, 5) - 1, oData2.SelectedPeriod.slice(0, 2), 0,
				0, 0);
			let newdate2 = new Date(oData2.SelectedPeriod2.slice(6), oData2.SelectedPeriod2.slice(3, 5) - 1, oData2.SelectedPeriod2.slice(0, 2),
				0, 0, 0);
			if (newdate1.getTime() > newdate2.getTime()) {
				MessageBox.warning("Período inicial maior que final");
				return;
			}

			var xhttp = new XMLHttpRequest();
			xhttp.open("POST", "/fethab/produto/add", true);
			xhttp.setRequestHeader('content-type', 'application/json');

			var content = {
				product: oData2.SelectedProduct,
				cod_item: oData2.CodItem,
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
			var view = this.getView().byId('ProdutoEditDialog');
			var data = this.getView().byId('ProdutoEditDialog').getModel().getData();

			if (!data.SelectedPeriod2.match(dateReg)) {
				MessageBox.warning("Formato de período incorreto, use o seletor para definir o período");
				return;
			}

			let newdate1 = new Date(data.SelectedPeriod.slice(6), data.SelectedPeriod.slice(3, 5) - 1, data.SelectedPeriod.slice(0, 2), -3, 0,
				0);
			let newdate2 = new Date(data.SelectedPeriod2.slice(6), data.SelectedPeriod2.slice(3, 5) - 1, data.SelectedPeriod2.slice(0, 2), -3,
				0, 0);
			if (newdate1.getTime() > newdate2.getTime()) {
				MessageBox.warning("Período inicial maior que final");
				return;
			}

			var xhttp = new XMLHttpRequest();
			xhttp.open("PATCH", "/fethab/produto/edit", true);
			xhttp.setRequestHeader('content-type', 'application/json');

			var content = {
				product: data.SelectedProduct,
				cod_item: data.CodItem,
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
			var sPath = e.getSource('PRODUTO').getBindingContext();
			var oModel = this.getView().byId('tableProduto').getModel();
			var oRowData = oModel.getProperty(sPath.sPath);
			console.log(oRowData);
			var xhttp = new XMLHttpRequest();
			xhttp.open("DELETE", "/fethab/produto/delete", true);
			xhttp.setRequestHeader('content-type', 'application/json');

			var content = {
				product: oRowData.PRODUTO,
				cod_item: oRowData.COD_ITEM,
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

			oData2.SelectedPeriod = date;
			oData2.SelectedPeriod2 = date2;
			oData2.SelectedProduct = "";
			oData2.CodItem = "";

			var oModel = new JSONModel(oData2);
			this.getView().byId('ProdutoAddDialog').setModel(oModel);

			var oDialog = this.byId("ProdutoAddDialog");
			oDialog.open();
		},
		onEdit: function (e) {
			var view = this.getView();
			var sPath = e.getSource('PRODUTO').getBindingContext();
			var oModel = this.getView().byId('tableProduto').getModel();
			var oRowData = oModel.getProperty(sPath.sPath);
			//	console.log(oRowData.DT_INI,oRowData.DT_FIN);
			var date1 = oRowData.DT_INI.slice(6) + '/' + oRowData.DT_INI.slice(4, 6) + '/' + oRowData.DT_INI.slice(0, 4);
			var date2 = oRowData.DT_FIN.slice(6) + '/' + oRowData.DT_FIN.slice(4, 6) + '/' + oRowData.DT_FIN.slice(0, 4);

			var obj = {
				SelectedProduct: oRowData.PRODUTO,
				CodItem: oRowData.COD_ITEM,
				SelectedPeriod: date1,
				SelectedPeriod2: date2,
				ProductCollection: oData2.ProductCollection
			};

			let oModel1 = new JSONModel(obj);
			this.getView().byId('ProdutoEditDialog').setModel(oModel1);

			var oDialog = this.byId("ProdutoEditDialog");
			oDialog.open();
		},
		onClose: function () {
			var oDialog = this.byId("ProdutoAddDialog");
			oDialog.close();
		},
		onClose2: function () {
			var oDialog = this.byId("ProdutoEditDialog");
			oDialog.close();
		}

	});

	function updateTable(view) {
		var xhttp = new XMLHttpRequest();
		xhttp.open("GET", "/fethab/produto/alldata", true);
		xhttp.send();
		xhttp.onreadystatechange = function () {
			//console.log(this.responseText);
			if (this.readyState === 4 && this.status === 200) {
				var response = JSON.parse(this.responseText);

				var produto = {
					PRODUTO: response.produto
				};
				var oModelProduto = new JSONModel(produto);
				view.byId('tableProduto').setModel(oModelProduto);

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