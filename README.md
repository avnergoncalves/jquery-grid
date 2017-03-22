XGrid
===========

XGrid is a plugin for creating dynamic and staticas grids. The goal is to create plugin from grids of an easy, fast and with a great performance no way to load the borwser user. 

With jQuery grid you can page, sort, filter, cache (cookies and url) queries and create events to gird dynamic or static. Its biggest advantage is the other grids are the events that are present in various parts during handling and loading of the grid, so you can complete the customization, meeting all the demand.

##Requirements
- jQuery-1.9.0+

##Installation

The grid requires placement of HTML, CSS, and JavaScript. The HTML should use your existing grid system, including both a container and individual columns. The CSS sets up the appropriate styles necessary to display the grid. And lastly, the JavaScript sets up the grid toggling functionality, as well as handling the horizontal grid styles.

###Step 1: Adding the HTML
You just need an element that will be the target for your grid.

```
<div id="example"></div>
```

###Step 2: Adding the JavaScript
- jquery.grid.js: This file is mandatory and it is there that contains all of the core grid.
- jquery.grid.additional.js: This file is mandatory, it contains the events of the grid and you must customize this file if necessary.

```
<script src="js/jquery-grid.js" type="text/javascript"></script>
<script src="js/jquery-grid-additional.js" type="text/javascript"></script>
```

###Step 3: Adding the CSS

##Usage

###Dinamic

The code below creates a dynamic grid, loading server information by ajax.

```
$("#example").grid(
	{
		url : "file.php",
		data:{
			filter: $('#filter')
		},
		colluns : [ {
			name : '<input type="checkbox" id="chk_all" />',
			th : {'width' : "5%"},
			td : {'align' : "left"},
			order : false,
			acoes : {
				"checkbox" : function(res, row_id) {
					console.log('click');
				},
			}
		}, {
			name : "Name",
			th : {'width' : "20%"},
			td : {'align' : "left"}
		},{
			name : "Age",
			th : {'width' : "20%"},
			td : {'align' : "left"}
		},{
			name : "E-mail",
			th : {'width' : "15%"}
		},{
			name : "Tel",
			th : {'width' : "10%"}
		},{
			name : "Status",
			order : false,
			th : {'width' : "5%"},
			acoes : {
				"active" : function(res, row_id) {
					window.location.href = "active.php?id=" + res;
				},
				"deactivate" : function(res, row_id) {
					window.location.href = "deactivate.php?id=" + res;
				}
			}
		},{
			name : "Status",
			order : false,
			th : {'width' : "5%"},
			icone : {'on': 'icone-preto ui-icon-check', 'off': 'icone-preto ui-icon-closethick'}
		} ]
});
```
The return must be an ajax JSON as below.

```
{"data":[
	{
		"1": {"value": 1, "events": "checkbox"}, 
		"2": "Nome 1", 
		"3": "23", 
		"4": "test@test.com",
		"5": "(11) 1111-11-11", 
		"6": {"value": 2, "events": "deactivate"},
		"7": {"icon": "on"}
	},{
		"1": {"value": 2, "events": "checkbox"},
		"2": "Nome 2", 
		"3": "25", 
		"4": "test@test.com",
		"5": "(22) 2222-22-22", 
		"6": {"value": 2, "events": "active"},
		"7": {"icon": "off"}
	}
], "total": 2}
```

###Static


##Options

- autoload:

- limite:

- url:

- data:

- cache_url:

- cache_cookie:

- table: 
	- id: 
	- width: 
	- cellpadding: 
	- cellspacing: 
	- border: 
	- class: 
					
- colluns:
	- name:
	- td:
	- th:
	- acoes:
	- icone: 


- paginacao:
	- top:
	- button:
	- attr:

- order:
	- ini:
	- classDesc:
	- classAsc:



##Events

- success:

- on_create_row:

- on_create_cell:

- on_create_icon:

- on_create_action:

##Browser Support
- Internet Explorer: 6+
- Firefox: 27+
- Chrome: 31+
- Safari: 7+
- Opera: 20+

