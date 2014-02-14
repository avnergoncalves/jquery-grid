$.grid.setDefaults({
	 mi_excessao: "Não foram encontrados resultados para a sua busca."
	,paginacao:    {top:true,button:true,attr:{"class":"btn-group"}}
	,on_create_total: function(thar, inicio, limite ,total){
		
		var elem = document.createElement('div');		
		elem.className = 'grid-consula-total';
	    
    	txt = document.createTextNode(inicio+' - '+limite+' de '+total);    	
    	elem.appendChild(txt);
		
		return elem;
		
	}
	,on_create_first_btn: function(that, paginaAtual){
		var tag  = (paginaAtual == 1) ? 'span' : 'a';
		
    	var elem = document.createElement(tag);
    	var i 	 = document.createElement('i');
    	
    	elem.className = 'btn-2';
    	    	
    	i.className = 'icone-cinza ui-icon-seek-first';
    	
    	if(paginaAtual != 1){
    		elem.setAttribute('href', 'javascript:;');
    		elem.onclick = function(){ that.reload({pagina: 1}); };
        	i.className  = 'icone-preto ui-icon-seek-first';
    	}    	    
    	
    	elem.appendChild(i);
    	
    	return elem;
	}
	,on_create_prev_btn: function(that, paginaAtual){
		
		var tag  = (paginaAtual == 1) ? 'span' : 'a';
		
		var elem = document.createElement(tag);		
		var i 	 = document.createElement('i');
		
    	elem.className = 'btn-2';
    	
    	i.className = 'icone-cinza ui-icon-seek-prev';
    	
    	if(paginaAtual != 1){
    		elem.setAttribute('href', 'javascript:;');
    		elem.onclick = function(){ that.reload({pagina: paginaAtual-1}); };    	
    		i.className  = 'icone-preto ui-icon-seek-prev';
    	}
    	    	
    	elem.appendChild(i);
    	return elem;
	}
	,on_create_pg_btn: function(that, paginaAtual, i){
		
		var tag  = (paginaAtual == i) ? 'span' : 'a';
		
		var elem = document.createElement(tag);			
		
		if(paginaAtual != i){
			elem.setAttribute('href', 'javascript:;');
			elem.onclick   = function(){ that.reload({pagina:jQuery(this).text()}); };
		}
		    	
		elem.className = 'btn-2';
		    	    
    	txt = document.createTextNode(i);    	
    	elem.appendChild(txt);
    	
    	return elem;		
	}
	,on_create_next_btn: function(that, paginaAtual, totalPage){
		
		var tag  = (paginaAtual == totalPage) ? 'span' : 'a';
		
		var elem = document.createElement(tag);
		
		var i 	 = document.createElement('i');
		
    	elem.className = 'btn-2';
    	
    	i.className = 'icone-cinza ui-icon-seek-next';
    	
    	if(paginaAtual != totalPage){
    		elem.setAttribute('href', 'javascript:;');
    		elem.onclick   = function(){ that.reload({pagina: paginaAtual+1}); };
    		i.className = 'icone-preto ui-icon-seek-next';
    	}
    	    	    	   
    	elem.appendChild(i);
    	return elem;
		
	}
	,on_create_end_btn: function(that, paginaAtual, totalPage){
		var tag  = (paginaAtual == totalPage) ? 'span' : 'a';
		
		var elem = document.createElement(tag);
		
		var i 	 = document.createElement('i');
		
    	elem.className = 'btn-2';		            	
    	
    	i.className = 'icone-cinza ui-icon-seek-next';
    	
    	if(paginaAtual != totalPage){
    		elem.setAttribute('href', 'javascript:;');
    		elem.onclick   = function(){ that.reload({pagina: totalPage}); };
    		i.className = 'icone-preto ui-icon-seek-end';
    	}
    	    	    	   
    	elem.appendChild(i);
    	return elem;
	}
	/*,on_create_row: function(row, response, i){
			var classCss = (i%2 == 0) ? '' : 'clara';
			if(classCss){
				row.className = classCss;
			}
	}*/	
	/*,on_create_cell: function(cell, response){
		var txt = document.createTextNode(response);
		cell.appendChild(txt);
	}*/
	,on_create_icon: function(cell, response, param_icone, row_id){
		var tag_i = document.createElement('i');
		tag_i.className = param_icone[response.icon];
		
		cell.appendChild(tag_i);
	}
	,on_create_action: function(cell, response, func_acoes, row_id){
		
		var conf_acoes = {
				 'editar':  'icone-preto ui-icon-pencil'
		};
		
		if(!response.events){
			console.log("O retorno das colunas acoes deve ser: array('value' => value, 'events' => 'evento1|evento2')");
			return;
		}
		
		var events = response.events.split('|');

		$.each(events, function(i){
			var evento = events[i];
			
			switch (evento) {
				case 'checkbox':
					var input  = document.createElement('input');
					input.setAttribute('type', evento);
					input.setAttribute('value', response.value);
					input.setAttribute('name', 'checkbox[]');
					
					input.onclick = function(){func_acoes[evento](response.value, row_id);};
					
					cell.appendChild(input);
					break;
				default:
					var tag_a  = document.createElement('a');
					
					tag_a.setAttribute('href', 'javascript:;');
					tag_a.onclick = function(){func_acoes[evento](response.value, row_id);};
					
					var tag_i = document.createElement('i');
					tag_i.className = conf_acoes[evento];
					
					tag_a.appendChild(tag_i);
					cell.appendChild(tag_a);
					break;
			}
		});	
	}
	
});