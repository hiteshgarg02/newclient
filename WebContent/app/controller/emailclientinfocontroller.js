define(['app'], function (app) {
	app.controller('emailclientinfocontroller', ['$scope', function($scope) {
		
		//Tinymce Plugin - Start - Richtext editor
		$scope.loadtinymce = {
				paste_word_valid_elements: "b,strong,i,em,h1,h2,p,ol,ul,li,a,span,div,font-size,br,img,table,tbody,td,tfoot,th,thead,tr,del,ins,dl,dt,dd",
				selector: ".rteditable",
				theme: "modern",
				paste_retain_style_properties : "all",
                paste_strip_class_attributes : "none",
				plugins: [
							"advlist autolink lists link image charmap print preview hr anchor pagebreak",
							"searchreplace wordcount visualblocks visualchars",
							"insertdatetime media nonbreaking save table contextmenu directionality",
							"emoticons template paste textcolor colorpicker textpattern imagetools"
						 ],
			    toolbar: "insertfile | bold italic underline | bullist numlist | undo redo | styleselect | bold italic Underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent",
				statusbar: false,
				menubar: false,
				resize:false,
				plugins:"paste",
			};
		//Tinymce Plugin - End
		
		$scope.sendMAil = function(){
			
			var mailData = {};
			mailtoList = $scope.toList;
			mailccList = $scope.ccList;
			mailBody = $scope.comment;
			
			//Send the mail data to email service
			//TODO:
		}
		
	}]);
});