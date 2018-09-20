(function($) {

    $.fn.grid = function(options) {

        // se não encontrar nenhum elemento retorna nada.
        if (!this.length) {
            if (options && options.debug && window.console) {
                console.warn("Nenhuma ocorrencia encontrada para \"" + this.selector + "\". ");
            }
            return;
        }

        // already create grid for this element
        let grid = $.data(this[0], 'grid');
        if (grid) {
            return grid;
        }

        grid = new $.grid(options, $(this[0]));
        $.data(this[0], 'grid', grid);

        return grid;
    };

    $.hashCode = function(string) {
        let hash = 0;
        if (string.length === 0)
            return hash;

        let char;
        for (let i = 0; i < string.length; i++) {
            char = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        hash = (hash < 0) ? (hash * (-1)) : hash;

        return hash;
    };

    $.handleCookie = {

        criar : function(name, value, days, patch) {
            let expires;

            if (days) {
                let date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();

            } else {
                expires = "";
            }

            document.cookie = name + "=" + value + expires + ";  path=" + patch;
        },

        ler : function(name) {
            let nameEQ = name + "=";
            let ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];

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
        let params = false;

        if (value) {
            params = {};
            let pieces = value.split('&'), pair, i, l;
            for (i = 0, l = pieces.length; i < l; i++) {
                pair = pieces[i].split('=', 2);
                params[pair[0]] = (pair.length === 2 ? unescape(pair[1].replace(/\+/g, ' ')) : true);
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

    $.extend($.grid, {
        defaults : {
            table : {
                attrs: {}
            },
            pagination : {
                elementsPagination: ['#jquery-grid-pagination-elem'],
                elementsSummary: ['#jquery-grid-summary-elem'],
                enable: true,
                attrs : {
                    "class" : "jquery-grid-paginacao"
                }
            },
            limit : 50,
            cache_url : true,
            cache_cookie : false,
            url : false,
            beforeRender: false,
            afterRender : false,
            autoload : true,
            data : {},
            columns : {},
            templates : {},
            order : {
                default : [ "1", "ASC" ],
                desc: {
                    attrs: {
                        class : "desc",
                    }
                },
                asc: {
                    attrs: {
                        class : "asc"
                    }
                }
            },
            onCreateRow : function(row, response, i) {},
        },

        setDefaults : function(settings) {
            $.extend($.grid.defaults, settings);
        },

            prototype : {
                init : function() {

                    this.createTable();

                    let hash = (this.settings.cache_url || this.settings.cache_cookie) ? $.unparam(window.location.hash.substring(1)): {};

                    /* recovery from cookie */
                    if (hash.grid) {
                        let cookieSer = $.handleCookie.ler(this.namespace);
                        if (cookieSer) {
                            hash = $.unparam(cookieSer);
                        }

                        if (this.settings.cache_url) {
                            window.location.hash = cookieSer;
                        }
                    }
                    /* recovery from cookie */

                    if (this.settings.autoload || hash !== false) {

                        if (hash) {
                            this.objDataCache = hash;
                        }

                        let obj_data = {};

                        if (hash.page) {
                            obj_data.page = hash.page;
                        }

                        if (hash.limit) {
                            obj_data.limit = hash.limit;
                        }

                        this.populateFilters();
                        this.reload(obj_data);
                    }

                },

                populateFilters: function(){
                    for (let i in this.objDataCache) {
                        if (this.objDataCache[i] && $.inArray(i, [ 'page', 'order' ]) === -1 && this.settings.data[i]) {
                            this.settings.data[i].val(this.objDataCache[i]);
                        }
                    }
                },

                reload : function(data) {

                    if (this.settings.beforeRender) {
                        this.settings.beforeRender(this);
                    }

                    if (data && typeof data.page === 'undefined') {
                        for (let i in this.settings.data) {
                            if (typeof this.settings.data[i].val() !== 'undefined'
                                && this.settings.data[i].val() !== ''
                                && this.settings.data[i].attr('disabled') !== 'disabled') {
                                this.objDataCache[i] = this.settings.data[i].val();
                            } else {
                                delete this.objDataCache[i];
                            }
                        }

                        this.objDataCache.page = 1;
                    }

                    if (data && data.page) {
                        this.objDataCache.page = parseInt(data.page);
                    } else if (!this.objDataCache.page) {
                        this.objDataCache.page = 1;
                    }

                    this.objDataCache.limit = (this.objDataCache && this.objDataCache.limit) ? this.objDataCache.limit : this.settings.limit;
                    this.objDataCache.order = this.detectOrder(data, this.objDataCache);

                    this.renderGrid();
                },

                renderGrid : function() {
                    let $this = this;

                    let dataSerialized = this.setStorage(this.objDataCache);

                    if (this.settings.url !== false && typeof this.settings.url !== 'object') {

                        $.ajax({
                                url : this.settings.url,
                                type : 'get',
                                data : dataSerialized,
                                dataType : 'json',
                                success : function(response) {

                                    $this.createThead();
                                    $this.createTbody(response);
                                    $this.createPagination(response);

                                    if ($this.settings.afterRender) {
                                        $this.settings.afterRender($this);
                                    }
                                }
                        });

                    } else if (typeof this.settings.url === 'object') {

                        let arrObj = this.settings.url();
                        let response = {
                            total : 0,
                            data : []
                        };

                        if (arrObj != null) {

                            let order = this.getCurrentOrder();
                            if(order[1] === 'ASC'){
                                arrObj.sort(this.ascSort(order[0]));
                            }else{
                                arrObj.sort(this.descSort(order[0]));
                            }

                            response.total = arrObj.length;

                            let ini = this.objDataCache.limit * (this.objDataCache.page - 1);
                            let end = ini + this.objDataCache.limit;

                            if (end > response.total) {
                                end = response.total;
                            }

                            for (let i = ini; i < end; i++) {
                                response.data.push(arrObj[i]);
                            }
                        }

                        this.createThead();
                        this.createTbody(response);
                        this.createPagination(response);

                        if (this.settings.success) {
                            this.settings.success();
                        }
                    }
                },

                getCurrentOrder: function(){
                    return (this.objDataCache.order) ? this.objDataCache.order.split(" ") : this.settings.order.default;
                },

                createThead : function() {
                    let th, tr, span1, span2;

                    let $this = this;

                    let thead = this.element.find('thead');
                    let order = this.getCurrentOrder();

                    tr = document.createElement('tr');

                    $.each(this.settings.columns, function(i) {

                            th = document.createElement('th');
                            span1 = document.createElement('span');
                            span2 = document.createElement('span');

                            span1.innerHTML = $this.settings.columns[i]['name'];

                            if (typeof $this.settings.columns[i]['order'] === 'undefined' || $this.settings.columns[i]['order'] === true) {

                                th.onclick = function() {
                                    $this.reload({page : 1, order : i});
                                };

                                if (i === order[0]) {
                                    if(order[1] === 'DESC'){
                                        $this.setAllAttributes(span2, $this.settings.order.desc.attrs);
                                    }else{
                                        $this.setAllAttributes(span2, $this.settings.order.asc.attrs);
                                    }
                                }
                            }

                            $this.setAllAttributes(th, $this.settings.columns[i]['th']);

                            th.appendChild(span1);
                            th.appendChild(span2);
                            tr.appendChild(th);
                    });

                    thead.html('').append(tr);

                },

                createTbody : function(response) {
                    let row, row_id, cell, template, text;

                    let parser = new DOMParser();

                    let tbody = this.element.find('tbody');
                    tbody.html('');

                    let limit = (response.data) ?  response.data.length : limit;

                    if (limit > 0) {

                        for (let i = 0; i < limit; i++) {
                            row_id = 'tr_' + i;

                            row = document.createElement('tr');
                            row.setAttribute('id', row_id);

                            this.settings.onCreateRow(row, response.data[i], i);

                            for (let k in this.settings.columns) {
                                cell = document.createElement('td');

                                if(k in this.settings.templates){
                                    template = this.settings.templates[k](response.data[i]);
                                    cell.appendChild(parser.parseFromString(template, "text/html").body.firstChild);
                                }else{
                                    text = document.createTextNode(response.data[i][k]);
                                    cell.appendChild(text);
                                }

                                row.appendChild(cell);
                            }

                            tbody.append(row);
                        }
                    } else {
                        row = document.createElement('tr');
                        this.settings.onCreateRow(row, '', 0);

                        cell = document.createElement('td');
                        cell.colSpan = Object.keys(this.settings.columns).length;
                        cell.setAttribute('align', 'center');

                        text = document.createTextNode(this.settings.mi_excessao);
                        cell.appendChild(text);

                        row.appendChild(cell);
                        tbody.append(row);
                    }

                },

                createPagination : function(response) {

                    let div, first, prev, next, end, total;

                    let paginaAtual = this.objDataCache.page;
                    response.total = (response.total) ? response.total : 0;

                    let limit = this.objDataCache.limit * paginaAtual;
                    if (limit > response.total) {
                        limit = response.total;
                    }

                    let iniPage = paginaAtual - 2;
                    if (iniPage < 1) {
                        iniPage = 1;
                    }

                    let numPage = iniPage + 5;
                    let totalPage = Math.ceil(response.total / this.objDataCache.limit);

                    if (numPage > totalPage) {
                        numPage = totalPage + 1;
                        iniPage = totalPage - 4;
                    }

                    if (iniPage < 1) {
                        iniPage = 1;
                    }

                    let inicio = (this.objDataCache.limit * paginaAtual) - this.objDataCache.limit + 1;
                    if (inicio < 1) {
                        inicio = 1;
                    }

                    /*Botoes de Paginacao*/
                    if (totalPage > 1) {
                        if (this.settings.pagination.enable) {
                            total = this.settings.on_create_total(this, inicio, limit, response.total);

                            div = document.createElement('ul');
                            this.setAllAttributes(div, this.settings.pagination.attrs);


                            first = this.settings.on_create_first_btn(this, paginaAtual);
                            prev = this.settings.on_create_prev_btn(this, paginaAtual);

                            div.appendChild(first);
                            div.appendChild(prev);

                            for (let i = iniPage; i < numPage; i++) {
                                div.appendChild(
                                    this.settings.on_create_pg_btn(this, paginaAtual, i)
                                );
                            }

                            next = this.settings.on_create_next_btn(this, paginaAtual, totalPage);
                            end = this.settings.on_create_end_btn(this, paginaAtual, totalPage);

                            div.appendChild(next);
                            div.appendChild(end);

                            for(let k in this.settings.pagination.elementsPagination){
                                $(this.settings.pagination.elementsPagination[k]).html(div);
                            }

                            for(let k in this.settings.pagination.elementsSummary){
                                $(this.settings.pagination.elementsSummary[k]).html(total);
                            }
                        }

                    }else{
                        for(let k in this.settings.pagination.elementsPagination){
                            $(this.settings.pagination.elementsPagination[k]).html('');
                        }

                        for(let k in this.settings.pagination.elementsSummary){
                            $(this.settings.pagination.elementsSummary[k]).html('');
                        }
                    }
                    /*Botoes de Paginacao*/

                },

                detectOrder : function(data, cache) {
                    let order;

                    if (data && data.order) {
                        let orderUrl = (cache) ? cache.order.split(' ') : this.settings.order.default;
                        order = (orderUrl[0] === data.order && orderUrl[1] === 'ASC') ? data.order + ' DESC' : data.order + ' ASC';
                    } else {
                        order = (cache.order) ? cache.order : this.settings.order.default[0]+ ' ' + this.settings.order.default[1];
                    }

                    return order;
                },

                setStorage : function(objData) {

                    let dataSer = jQuery.param(objData);

                    if (this.settings.cache_url) {
                        window.location.hash = dataSer;
                    }

                    if (this.settings.cache_cookie) {
                        $.handleCookie.criar(this.namespace, dataSer, 0);
                    }

                    return dataSer;
                },

                descSort : function(property) {
                    return function(a, b) {
                        a = a[property].toLowerCase();
                        b = b[property].toLowerCase();
                        return (a < b) ? 1 : ((a > b) ? -1 : 0);
                    };
                },

                ascSort : function(property) {
                    return function(a, b) {
                        a = a[property].toLowerCase();
                        b = b[property].toLowerCase();
                        return (a > b) ? 1 : ((a < b) ? -1 : 0);
                    };
                },

                setAllAttributes : function(element, arr_attr) {

                    for ( let k in arr_attr) {
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

                createTable : function() {
                    let table, thead, tbody, tfoot;

                    table = document.createElement('table');
                    this.setAllAttributes(table, this.settings.table.attrs);

                    thead = document.createElement('thead');
                    table.appendChild(thead);

                    tbody = document.createElement('tbody');
                    table.appendChild(tbody);

                    tfoot = document.createElement('tfoot');
                    table.appendChild(tfoot);

                    this.element.html(table);
                }
            }

        });

})(jQuery);
