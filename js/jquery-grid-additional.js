$.grid.setDefaults({
    mi_excessao: "Não foram encontrados resultados para a sua busca.",
    table: {
        attrs: {
            "id" : "jquery-grid",
            "width" : "100%",
            "cellpadding" : "0",
            "cellspacing" : "0",
            "border" : "0",
            'class': "table table-striped table-hover table-bordered"
        }
    },
    pagination: {
        elementsPagination: ['#jquery-grid-pagination-elem'],
        elementsSummary: ['#jquery-grid-summary-elem'],
        enable: true,
        attrs: {"class": "pagination"}
    },
    order : {
        default : [ "date", "ASC" ],
        desc: {
            attrs: {
                class : "pull-right fa fa-caret-up",
            }
        },
        asc: {
            attrs: {
                class : "pull-right fa fa-caret-down"
            }
        }
    },
    beforeRender: (grid) => {
        $('#spinnerGrid').show();
        grid.element.hide();
    },
    afterRender: (grid) => {
        $('#spinnerGrid').hide();
        grid.element.show();
    },
    on_create_total: function($this, inicio, limite ,total){
       let elem = document.createElement('div');
       let txt = document.createTextNode(inicio+' - '+limite+' de '+total);
       elem.appendChild(txt);
       return elem;
       
    }
    ,on_create_first_btn: function(that, paginaAtual){
       let elem = document.createElement('li');
       let a    = document.createElement('a');

        let txt = document.createTextNode('<<');
        a.appendChild(txt);

       if(paginaAtual == 1){
           elem.className = 'disabled';
       }else{
           a.setAttribute('href', 'javascript:;');
           a.onclick = function(){ that.reload({page: 1}); };
       }
       
       elem.appendChild(a);
       
       return elem;
    }
    ,on_create_prev_btn: function(that, paginaAtual){
        let elem = document.createElement('li');
        let a    = document.createElement('a');

        let txt = document.createTextNode('<');
        a.appendChild(txt);

        if(paginaAtual == 1){
            elem.className = 'disabled';
        }else{
            a.setAttribute('href', 'javascript:;');
            a.onclick = function(){ that.reload({page: paginaAtual-1}); };
        }

        elem.appendChild(a);

        return elem;
    }
    ,on_create_pg_btn: function(that, paginaAtual, i){
        let elem = document.createElement('li');
        let a    = document.createElement('a');

        let txt = document.createTextNode(i);
        a.appendChild(txt);

        if(paginaAtual == i){
            elem.className = 'disabled';
        }else{
            a.setAttribute('href', 'javascript:;');
            a.onclick   = function(){ that.reload({page:jQuery(this).text()}); };
        }

        elem.appendChild(a);

        return elem;
    }
    ,on_create_next_btn: function(that, paginaAtual, totalPage){
        let elem = document.createElement('li');
        let a    = document.createElement('a');

        let txt = document.createTextNode('>');
        a.appendChild(txt);

        if(paginaAtual == totalPage){
            elem.className = 'disabled';
        }else{
            a.setAttribute('href', 'javascript:;');
            a.onclick   = function(){ that.reload({page: paginaAtual+1}); };
        }

        elem.appendChild(a);

        return elem;
    }
    ,on_create_end_btn: function(that, paginaAtual, totalPage){
        let elem = document.createElement('li');
        let a    = document.createElement('a');

        let txt = document.createTextNode('>>');
        a.appendChild(txt);

        if(paginaAtual == totalPage){
            elem.className = 'disabled';
        }else{
            a.setAttribute('href', 'javascript:;');
            elem.onclick   = function(){ that.reload({page: totalPage}); };
        }

        elem.appendChild(a);

        return elem;
    }
    /*,onCreateRow: function(row, response, i){
          let classCss = (i%2 == 0) ? '' : 'clara';
          if(classCss){
             row.className = classCss;
          }
    }*/
});
