jQuery Grid
===========

jQuery Grid is a plugin for creating dynamic and staticas grids. The goal is to create plugin from grids of an easy, fast and with a great performance no way to load the borwser user. 

With the jQuery Grid you can paginate, sort and create events for dynamic or static girds. Its major advantage is the other grids are the events that are present in several parts, during the loading and manipulation of the grid, so that you can complete customization, meeting any demand.

##Requirements
- jQuery

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
<script src="js/jquery.grid.js" type="text/javascript"></script>
<script src="js/jquery.grid.additional.js" type="text/javascript"></script>
```

###Step 3: Adding the CSS

##Usage
The code below creates a dynamic grid, Loading server information by ajax.

```
$("#grid_list_user").grid(
			{
				url : "/configuration/user/ajax/list",
				data:{
					filter: $('#filter')
				},
				colluns : [
						{
							name : '<input type="checkbox" id="chk_all" />',
							th : {'width' : "5%"},
							td : {'align' : "left"},
							order : false,
							acoes : {
								"checkbox" : function(res, row_id) {
									console.log('click');
								},
							}
						},
						{
							name : "Name",
							th : {'width' : "20%"},
							td : {'align' : "left"}
						},
						{
							name : "Age",
							th : {'width' : "20%"},
							td : {'align' : "left"}
						},
						{
							name : "E-mail",
							th : {'width' : "15%"}
						},
						{
							name : "Tel",
							th : {'width' : "10%"}
						},
						{
							name : "Editar",
							order : false,
							th : {'width' : "5%"},
							acoes : {
								"editar" : function(res, row_id) {
									window.location.href = "/configuration/user/edit?id=" + res;
								}
							}
						},
						{
							name : "Status",
							order : false,
							th : {'width' : "5%"},
							icone : {'ativo': 'icone-preto ui-icon-check', 'inativo': 'icone-preto ui-icon-closethick'}
						} ]
			});
```

##Options


##Events


##Browser Support
