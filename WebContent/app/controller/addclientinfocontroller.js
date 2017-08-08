define(['app'], function (app) {
	app.controller('addclientinfocontroller', ['$scope','$http', function($scope,$http) {
		
		initclientInformation();
		$scope.countryselection = {};
		$scope.clientList = {};
		
		function initclientInformation(){
			
			//Load the Country selection
			$http.get("app/mock-json/country.json").success(function(response) {
				$scope.countryselection = response;
				}).error(function (errorMessage){
					$scope.errorMessage = errorMessage; 
				});
			
			//Load the client data
			$http.get("app/mock-json/clientList.json").success(function(response) {
			    $scope.clientList = response;
			}).error(function (errorMessage){
				$scope.errorMessage = errorMessage; 
			});
			
			
    	}
		
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
		
		//Save client record - start
		$scope.saverecord = function(){
			
			$scope.clientDataNewList = [];
			var ctryCode = $scope.country.code;
			
			var addObject = {};
			addObject.name = $scope.name;
			addObject.organisation = $scope.organisation;
			addObject.address = $scope.address;
			addObject.phone = $scope.phone;
			addObject.country = ctryCode;
			addObject.comment = $scope.comment;
			
			if(ctryCode == 'CA'){
				$scope.clientDataNewList = $scope.clientList.CA;
			}else{
				$scope.clientDataNewList = $scope.clientList.US;
			}
			
			$scope.clientDataNewList.push(addObject);
			
			alert("Record Saved!!");
			
			//Save Record in JSON
			$http.put("app/mock-json/clientList.json", $scope.clientList).success(function(){
			});
			
			//Clear record
			$scope.clear();
			
		};
		//Save client record - end
		
		//Clear Record
		$scope.clear = function(){
			$scope.name = "";
			$scope.organisation ="";
			$scope.address="";
			$scope.phone="";
			$scope.country ="";
			$scope.comment ="";
			
		}
	}]);
});