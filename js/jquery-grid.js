(function($) {

	$.fn.grid = function(options) {

		// se não encontrar nenhum elemento retorna nada.
		if (!this.length) {
			if (options && options.debug && window.console) {
				console.warn("Nenhuma ocorrencia encontrada para \""
						+ this.selector + "\". ");
			}
			return;
		}

		// verifica se a grid ja foi criada para este elemento
		var grid = $.data(this[0], 'grid');
		if (grid) {
			return grid;
		}

		grid = new $.grid(options, $(this[0]));
		$.data(this[0], 'grid', grid);

		return grid;
	};

	$.hashCode = function(string) {
		var hash = 0;
		if (string.length == 0)
			return hash;
		for (var i = 0; i < string.length; i++) {
			char = string.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash;
		}

		hash = (hash < 0) ? (hash * (-1)) : hash;

		return hash;
	};

	$.cookie = {

		criar : function(name, value, days, patch) {
			var expires;

			if (days) {
				var date = new Date();
				date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
				expires = "; expires=" + date.toGMTString();

			} else {
				expires = "";
			}

			document.cookie = name + "=" + value + expires + ";  path=" + patch;
		},

		ler : function(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];

				while (c.charAt(0) == ' ') {
					c = c.substring(1, c.length);
				}

				if (c.indexOf(nameEQ) == 0) {
					return c.substring(nameEQ.length, c.length);
				}
			}
			return null;
		},

		apagar : function(name) {
			this.criar(name, "", -1);
		}

	};

	$.unparam = function(value) {
		var params = false;

		if (value) {
			params = {};
			var pieces = value.split('&'), pair, i, l;
			for (i = 0, l = pieces.length; i < l; i++) {
				pair = pieces[i].split('=', 2);
				params[pair[0]] = (pair.length == 2 ? pair[1].replace(/\+/g,
						' ') : true);
			}
		}
		return params;
	};

	$.grid = function(options, element) {

		this.settings = $.extend(true, {}, $.grid.defaults, options);

		this.element = element;
		this.namespace = 'GRID_' + $.hashCode(element.attr('id'));

		this.pg_superior = element.find('div.pg_superior');
		this.pg_inferior = element.find('div.pg_inferior');

		this.objDataCache = {};

		this.init();

	};

	$
			.extend(
					$.grid,
					{
						defaults : {
							table : {
								"id" : "jquery-grid",
								"width" : "100%",
								"cellpadding" : "0",
								"cellspacing" : "0",
								"border" : "0",
								"class" : ""
							},
							paginacao : {
								top : true,
								button : true,
								attr : {
									"class" : "jquery-grid-paginacao"
								}
							},
							limite : 50,
							cache_url : false,
							cache_cookie : true,
							url : false,
							success : false,
							autoload : true,
							colluns : [],
							data : {},
							acoes : {},
							order : {
								ini : [ "1", "ASC" ],
								classDesc : "desc",
								classAsc : "asc"
							},
							on_create_row : function(row, response, i) {
							},
							on_create_cell : function(cell, response) {
								var txt = document.createTextNode(response);
								cell.appendChild(txt);
							},
							on_create_icon : function(cell, response, acoes, row_id) {
							},
							on_create_action : function(cell, response, acoes, row_id) {
							}
						},

						setDefaults : function(settings) {
							$.extend($.grid.defaults, settings);
						},

						prototype : {
							init : function() {

								var cookieSer;

								var table = this.__cria_table();

								this.element.html(table);

								var hash = (this.settings.cache_url || this.settings.cache_cookie) ? $
										.unparam(window.location.hash
												.substring(1))
										: {};

								/*recupera do cookie*/
								if (hash.grid) {
									cookieSer = $.cookie.ler(this.namespace);

									if (cookieSer) {
										hash = $.unparam(cookieSer);
									}

									if (this.settings.cache_url) {
										window.location.hash = cookieSer;
									}
								}
								/*recupera do cookie*/

								if (this.settings.autoload || hash.grid) {

									/*popula inputs da pagina*/
									for (i in hash) {
										if (hash[i]
												&& $.inArray(i, [ 'pagina',
														'limite', 'order' ]) == -1
												&& this.settings.data[i]) {
											this.settings.data[i]
													.val(decodeURIComponent(hash[i]));
										}
									}
									/*popula inputs da pagina*/

									obj_data = {};

									if (hash) {
										this.objDataCache = hash;
									}

									if (hash.pagina) {
										obj_data.pagina = hash.pagina;
									}

									if (hash.limite) {
										obj_data.limite = hash.limite;
									}

									this.reload(obj_data);

								}

							},

							reload : function(data) {
								if (data && typeof data.pagina == 'undefined') {
									for (i in this.settings.data) {
										if (typeof this.settings.data[i].val() != 'undefined'
												&& this.settings.data[i].val() != ''
												&& this.settings.data[i]
														.attr('disabled') != 'disabled') {
											this.objDataCache[i] = unescape(this.settings.data[i]
													.val());
										} else {
											delete this.objDataCache[i];
										}
									}

									this.objDataCache.pagina = 1;
								}

								if (data && data.pagina) {
									this.objDataCache.pagina = parseInt(data.pagina);
								} else if (!this.objDataCache.pagina) {
									this.objDataCache.pagina = 1;
								}

								this.objDataCache.limite = (data && data.limite) ? data.limite
										: this.settings.limite;
								this.objDataCache.order = this.__detectOrder(
										data, this.objDataCache);

								this.__renderGrid();
							},

							__renderGrid : function() {
								var that = this;

								var dataSerialized = this
										.__setStorage(this.objDataCache);

								if (!$.isFunction(this.settings.url)
										&& this.settings.url != false) {

									$
											.ajax({
												url : this.settings.url,
												type : 'get',
												data : dataSerialized,
												dataType : 'json',
												success : function(response) {

													that.__monta_body(response);
													that
															.__monta_paginacao(response);

													if (that.settings.success) {
														that.settings
																.success(response);
													}
												}
											});

								} else if (jQuery.isFunction(this.settings.url)) {

									var arrObj = this.settings.url();
									var response = {
										total : 0,
										data : []
									};

									if (arrObj != null) {

										/*var order = (this.objDataCache.order) ? this.objDataCache.order.split(" ") : ['1', 'ASC'];
										if(order[1] == 'ASC'){
											arrObj.sort(this.__ascSort(order[0]));
										}else{
											arrObj.sort(this.__descSort(order[0]));
										}*/

										response.total = arrObj.length;

										var inicio = this.settings.limite
												* (this.objDataCache.pagina - 1);
										var fim = inicio + this.settings.limite;

										if (fim > response.total) {
											fim = response.total;
										}

										for (var i = inicio; i < fim; i++) {
											response.data.push(arrObj[i]);
										}
									}

									this.__monta_body(response);
									this.__monta_paginacao(response);

									if (this.settings.success) {
										this.settings.success();
									}
								}
							},

							__monta_body : function(response) {
								var limite = this.settings.limite;
								var tbody = this.element.find('tbody');

								tbody.html('');

								var row, row_id, cell, y;

								if (response.data) {
									if (response.data.length < this.settings.limite) {
										limite = response.data.length;
									}
								} else {
									limite = 0;
								}

								if (limite > 0) {

									for (var i = 0; i < limite; i++) {
										row_id = 'tr_' + i;

										row = document.createElement('tr');
										row.setAttribute('id', row_id);

										this.settings.on_create_row(row,
												response.data[i], i);

										y = 0;
										for ( var k in response.data[i]) {

											cell = document.createElement('td');

											if (this.settings.colluns[y]['acoes']) {
												this.settings.on_create_action(cell, response.data[i][k], this.settings.colluns[y]['acoes'], row_id);
											}else if(this.settings.colluns[y]['icone']){
												this.settings.on_create_icon(cell, response.data[i][k], this.settings.colluns[y]['icone'], row_id);
											} else {
												this.settings.on_create_cell(cell, response.data[i][k]);

												if (this.settings.colluns[y].css_class) {
													cell.className = this.settings.colluns[y].css_class;
												}
											}

											row.appendChild(cell);
											y++;
										}

										tbody.append(row);
									}
								} else {
									row = document.createElement('tr');
									this.settings.on_create_row(row, '', 0);

									cell = document.createElement('td');
									cell.colSpan = this.settings.colluns.length;

									this.settings.on_create_cell(cell,
											this.settings.mi_excessao);

									row.appendChild(cell);
									tbody.append(row);
								}

							},

							__monta_paginacao : function(response) {

								var div, first, prev, pg, next, end, total;

								var paginaAtual = this.objDataCache.pagina;
								response.total = (response.total) ? response.total
										: 0;

								var limite = this.settings.limite * paginaAtual;
								if (limite > response.total) {
									limite = response.total;
								}

								var iniPage = paginaAtual - 2;
								if (iniPage < 1) {
									iniPage = 1;
								}

								var numPage = iniPage + 5;
								var totalPage = Math.ceil(response.total
										/ this.settings.limite);

								if (numPage > totalPage) {
									numPage = totalPage + 1;
									iniPage = totalPage - 4;
								}

								if (iniPage < 1) {
									iniPage = 1;
								}

								var inicio = (this.settings.limite * paginaAtual)
										- this.settings.limite + 1;
								if (inicio < 1) {
									inicio = 1;
								}

								/*Botoes de Paginacao*/
								if (totalPage > 1) {

									if (this.settings.paginacao.top) {

										total = this.settings.on_create_total(
												this, inicio, limite,
												response.total);
										total.setAttribute('id',
												'jquery-grid-total-top');

										div = document.createElement('div');
										this.__set_all_attribute(div,
												this.settings.paginacao.attr);
										div.setAttribute('id',
												'jquery-grid-paginacao-top');

										first = this.settings
												.on_create_first_btn(this,
														paginaAtual);
										prev = this.settings
												.on_create_prev_btn(this,
														paginaAtual);

										div.appendChild(first);
										div.appendChild(prev);

										for (var i = iniPage; i < numPage; i++) {
											pg = this.settings
													.on_create_pg_btn(this,
															paginaAtual, i);
											div.appendChild(pg);
										}

										next = this.settings
												.on_create_next_btn(this,
														paginaAtual, totalPage);
										end = this.settings.on_create_end_btn(
												this, paginaAtual, totalPage);

										div.appendChild(next);
										div.appendChild(end);

										$(
												'#jquery-grid-paginacao-top, #jquery-grid-total-top')
												.remove();

										this.element.prepend(total);
										this.element.prepend(div);
									}

									if (this.settings.paginacao.button) {

										total = this.settings.on_create_total(
												this, inicio, limite,
												response.total);
										total.setAttribute('id',
												'jquery-grid-total-button');

										div = document.createElement('div');
										this.__set_all_attribute(div,
												this.settings.paginacao.attr);
										div.setAttribute('id',
												'jquery-grid-paginacao-button');

										first = this.settings
												.on_create_first_btn(this,
														paginaAtual);
										prev = this.settings
												.on_create_prev_btn(this,
														paginaAtual);

										div.appendChild(first);
										div.appendChild(prev);

										for (var i = iniPage; i < numPage; i++) {
											pag = this.settings
													.on_create_pg_btn(this,
															paginaAtual, i);
											div.appendChild(pag);
										}

										next = this.settings
												.on_create_next_btn(this,
														paginaAtual, totalPage);
										end = this.settings.on_create_end_btn(
												this, paginaAtual, totalPage);

										div.appendChild(next);
										div.appendChild(end);

										$(
												'#jquery-grid-paginacao-button, #jquery-grid-total-button')
												.remove();

										this.element.append(div);
										this.element.append(total);
									}

								}
								/*Botoes de Paginacao*/

							},

							__detectOrder : function(data, cache) {
								var order;

								if (data && data.order) {
									var orderUrl = (cache) ? cache.order
											.split(' ')
											: this.settings.order.ini;
									order = (orderUrl[0] == data.order && orderUrl[1] == 'ASC') ? data.order
											+ ' DESC'
											: data.order + ' ASC';
								} else {
									order = (cache.order) ? cache.order
											: this.settings.order.ini[0]
													+ ' '
													+ this.settings.order.ini[1];
								}

								return order;
							},

							__setStorage : function(objData) {

								var dataSer = jQuery.param(objData);

								if (this.settings.cache_url) {
									window.location.hash = dataSer;
								}

								if (this.settings.cache_cookie) {
									$.cookie.criar(this.namespace, dataSer, 0);
								}

								return dataSer;
							},

							__descSort : function(property) {
								return function(a, b) {
									a = a[property].toLowerCase();
									b = b[property].toLowerCase();
									return (a < b) ? 1 : ((a > b) ? -1 : 0);
								};
							},

							__ascSort : function(property) {
								return function(a, b) {
									a = a[property].toLowerCase();
									b = b[property].toLowerCase();
									return (a > b) ? 1 : ((a < b) ? -1 : 0);
								};
							},

							__set_all_attribute : function(element, arr_attr) {

								for ( var k in arr_attr) {
									if (typeof arr_attr[k] == 'string'
											&& arr_attr[k] != '') {
										if (k == 'class') {
											element.className += (element.className != '') ? ' '
													+ arr_attr[k]
													: arr_attr[k];
										} else {
											element
													.setAttribute(k,
															arr_attr[k]);
										}
									}
								}

							},

							__cria_table : function() {
								var table, thead, th, tr, tbody, tfoot;

								var that = this;

								table = document.createElement('table');
								this.__set_all_attribute(table,
										this.settings.table);

								thead = document.createElement('thead');
								tr = document.createElement('tr');

								$
										.each(
												this.settings.colluns,
												function(i) {
													var count = i + 1;

													th = document
															.createElement('th');

													th.innerHTML = that.settings.colluns[i]['name'];

													if (typeof that.settings.colluns[i]['order'] == 'undefined'
															|| that.settings.colluns[i]['order'] == true) {
														th.onclick = function() {
															that.reload({
																pagina : 1,
																order : count
															});
														};

														if (count == that.settings.order.ini[0]) {
															th.className += (that.settings.order.ini[1] == 'DESC') ? that.settings.order.classDesc
																	: that.settings.order.classAsc;
														}
													}

													that
															.__set_all_attribute(
																	th,
																	that.settings.colluns[i]['th']);

													tr.appendChild(th);
												});

								thead.appendChild(tr);
								table.appendChild(thead);

								tbody = document.createElement('tbody');
								table.appendChild(tbody);

								tfoot = document.createElement('tfoot');
								table.appendChild(tfoot);

								return table;
							}
						}

					});

})(jQuery);