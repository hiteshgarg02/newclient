define(['app'], function (app) {
	app.controller('viewclientinfocontroller', ['$scope', '$http', function($scope, $http) {
		
		initclientInformation();
		$scope.viewRecords = false; 
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
		
		//Client Data on the basis of the country selection
		$scope.ctrySelected = function(ctrySelected){
			$scope.viewRecords = true;
			if(ctrySelected.code == 'CA'){
				$scope.showClientDataList = $scope.clientList.CA;
			}else
				{
				$scope.showClientDataList = $scope.clientList.US;
			}
		}

		
	}]);
});