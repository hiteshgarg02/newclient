define([ 'angularAMD', 'ui.bootstrap', 'ui.tinymce', 'directives'], function(angularAMD) {
	
	var app = angular.module("clientInventory", ['ui.bootstrap', 'ui.tinymce']);
	
	return angularAMD.bootstrap(app);
});