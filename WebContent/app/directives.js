define([ 'angularAMD'], function(angularAMD) {
	angularAMD.directive('ibmFooter', function() {
		var directive = {};

		directive.restrict = 'E'; /* restrict this directive to elements */
		directive.templateUrl = "app/views/templates/footer.htm";

		return directive;
	}).directive('ibmHeader', function() {
		var directive = {};

		directive.restrict = 'E'; /* restrict this directive to elements */
		directive.templateUrl = "app/views/templates/header.htm";

		return directive;
	}).directive('leftNavigation', ['$location', 'FUNCTION_CODES', function($location, FUNCTION_CODES) {
		return {
			restrict : 'E',
			templateUrl : 'app/views/templates/menu.htm',
			controller: function($scope, $filter) {
				$scope.FUNCTION_CODES = FUNCTION_CODES;
			},
			link : function link(scope, element, attrs) {
				scope.path = $location.path();
			}
		};
	}]).directive('welcomeLeftNavigation', function() {
		return {
			restrict : 'E',
			templateUrl : 'app/views/templates/welcomemenu.htm'
		};
	}).directive('gdmleftNavigation',[ '$location','GDM_FUNCTION_CODES',  function($location,GDM_FUNCTION_CODES) {
		return {
			restrict : 'E',
			templateUrl : 'app/views/templates/gdmmenu.htm',
			controller: function($scope, $filter) {
				$scope.GDM_FUNCTION_CODES = GDM_FUNCTION_CODES;
			},
			link : function link(scope, element, attrs) {
				scope.path = $location.path();
			}
		};
	}]).directive('gdmwelcomeLeftNavigation', function() {
		return {
			restrict : 'E',
			templateUrl : 'app/views/templates/gdmwelcomemenu.htm'
		};
	}).directive('visibilityRule', ['$location',function($location) {
		return {
			restrict : 'A',
			prioriry : 100000,
			link : function(scope,element, attr) {			
				var allowed = false;
				var functionVal = attr["visibilityRule"].split(",");				
				for (var loop=0; loop < functionVal.length; loop++){
					if(!allowed){
						allowed = scope.groupProfileFunctions && scope.groupProfileFunctions.functionMap[functionVal[loop]];
					}
				}					
				if (!allowed) {					
					element.children().remove();
					element.remove();
				}				
				if (!scope.groupProfileFunctions) {
					$location.path ='/login';
				}
			}
		}
	}]).directive('gdmVisibilityRule', ['GDMCommon',function(GDMCommon) {
		return {
			restrict : 'A',
			prioriry : 100000,
			link : function(scope,element, attrs) {
				//if (!GDMCommon.groupProfileFunctions) return;
				var functionVal = attrs["gdmVisibilityRule"].split(",");	
				var allowed=false;
			
				if(GDMCommon.groupProfileFunctions){
					for (var loop=0; loop < functionVal.length; loop++){						
						if(!allowed){							
							allowed = GDMCommon.groupProfileFunctions.functionMap[functionVal[loop]];
							if(angular.isUndefined(allowed)){
								allowed =false;
							}						
						}				
					}	
				}
				
				if (GDMCommon.viewOnlyGDM=="E" && (!allowed) ) { 
					element.children().remove();
					element.remove();
				}				
				if (!GDMCommon.groupProfileFunctions) {
					$location.path ='/login';
				}
			}
		}
	}]).directive('navMenu', function($location) {
		
		// works good only a single issue, visibility rule for menu
		// active in active menu items, enabling a child menu item does not activate its parent
		  return function(scope, element, attrs) {
			    var links = element.find('a'),
			        onClass = attrs.navMenu || 'ibm-is-active',
			        routePattern,
			        link,
			        url,
			        currentLink,
			        urlMap = {},
			        i;

			    if (!$location.$$html5) {
			      routePattern = /^#[^/]*/;
			    }

			    for (i = 0; i < links.length; i++) {
			      link = angular.element(links[i]);
			      url = link.attr('href');
			      if(angular.isUndefined(url)){
			    	  continue;
			      }

			      if ($location.$$html5) {
			        urlMap[url] = link;
			      } else {
			        urlMap[url.replace(routePattern, '')] = link;
			      }
			    }

			    scope.$on('$routeChangeStart', function() {
			      var pathLink = urlMap[$location.path()];

			      if (pathLink) {
			        if (currentLink) {
			          currentLink.removeClass(onClass);
			        }
			        currentLink = pathLink;
			        currentLink.addClass(onClass);
			      }
			    });
			  };
			}).directive('newsgeohierarchy',['$http','Login',function($http,Login){

				return {
					restrict : 'E',
					templateUrl: 'app/views/templates/newsgeoHierarchy.html',
					controller: function($scope, $filter) {
						$scope.profile = Login.groupProfileFunctions;	
						var request = {
			    				 method: 'POST',
			    				 url: '/services/epricer/v2/settings/api/GeoHierarchy/nwgc',
			    				 headers: {
			    				   'Content-Type': 'application/json'
			    				 }
			    				}

						
						$http(request).success(function(response) {
							
								$scope.selectionItem = $filter('orderBy')(response, 'description');
								if ($scope.geoContainer){
									$scope.geoContainer.geoJson = response;
								}
								
								if($scope.atLoad){
									$scope.atLoad(info);
								}//$scope.geoContainer.selection = $scope.selectionItem[0];
							});
						$scope.itemSelected = function(selection){
							if (angular.isArray(selection) && selection[0]==undefined && selection.length!=0){
								$scope.geoContainer.selection=$scope.geoContainer.geoJson
							}
							if($scope.clearView){
								$scope.clearView();
							}
							
						};
						
						$scope.changeSelection = function(){
							if (angular.isArray($scope.geoContainer.childSelection) && 
									$scope.geoContainer.childSelection[0]==undefined && $scope.geoContainer.childSelection.length!=0){
								$scope.geoContainer.childSelection=$scope.geoContainer.pureChildren
							}
							
							if($scope.clearView){
								$scope.clearView();
							}
						}
					}
				};
			
			}]).directive('geohierarchy', ['$http','Login', function($http,Login) {
				return {
					restrict : 'E',
					templateUrl: 'app/views/templates/geoHierarchy.html',
					controller: function($scope, $filter, $attrs) {
						$scope.profile = Login.groupProfileFunctions;	

						var sourceTable = $attrs["sourceTable"]
                        if (angular.isUndefined(sourceTable) || sourceTable==null || sourceTable==''){
                        	sourceTable = 'GHS'
                        }
						
						var info = {}; 
						 info.profilelevel = Login.groupProfileFunctions.profilelevel;
						 info.geoCode = Login.groupProfileFunctions.geoCode;
						 info.ctryCodes = Login.groupProfileFunctions.ctryCodes;
						 info.sourceTable = sourceTable;
						 
						 $scope.profileInfo = info
						var request = {
			    				 method: 'POST',
			    				 url: '/services/epricer/v2/settings/api/GeoHierarchy/wgc',
			    				 headers: {
			    				   'Content-Type': 'application/json'
			    				 },
			    				 data: info
			    				}

						
						$http(request).success(function(response) {
							
								if ((($scope.geoContainer.midMultiple == 'Y' && ($scope.geoContainer.hierarchySelection.level == 'C' || $scope.geoContainer.level == 'C')) || 
										($scope.geoContainer.endMultiple == 'Y') && !($scope.geoContainer.hierarchySelection.level == 'C' || $scope.geoContainer.level == 'C'))){
									if (response && response.length > 1){
										$scope.selectionItem = [{code:'',description:'Select All', children:[]}].concat($filter('orderBy')(response, 'description'));
									} else {
										$scope.selectionItem = $filter('orderBy')(response, 'description');
									}
								}else{
									$scope.selectionItem = $filter('orderBy')(response, 'description');
								}

								if ($scope.geoContainer){
									$scope.geoContainer.geoJson = response;
									$scope.geoContainer.countryMap = [];
									$scope.geoContainer.geoMap = [];
									angular.forEach(response, function(geoObject){
										if(geoObject && geoObject.children){
											$scope.geoContainer.geoMap[geoObject.code] = geoObject.children;
											angular.forEach(geoObject.children, function(countryObject){
												if(countryObject){
													$scope.geoContainer.countryMap[countryObject.code] = countryObject.description;
												}
											});
										}
									});
								}
								
								if($scope.atLoad){
									$scope.atLoad(info);
								}//$scope.geoContainer.selection = $scope.selectionItem[0];
							});
						$scope.itemSelected = function(selection){
							if (angular.isArray(selection) && selection[0]==undefined && selection.length!=0){
								$scope.geoContainer.selection=$scope.geoContainer.geoJson
							}else{
								if(selection!=undefined){
									if (selection.children){
										$scope.geoContainer.children = selection.children;
										//$scope.geoContainer.childSelection = selection.children[0];
										$scope.geoContainer.children = $filter('orderBy')($scope.geoContainer.children, 'description');
										$scope.geoContainer.childSelection = null;
									} else {
										$scope.geoContainer.children = [];
										for (var loop=0; loop<selection.length; loop++){
											$scope.geoContainer.children = $scope.geoContainer.children.concat(selection[loop].children);
										}
										
										$scope.geoContainer.children = $filter('orderBy')($scope.geoContainer.children, 'description');
										//$scope.geoContainer.childSelection = $scope.geoContainer.children[0];
										$scope.geoContainer.childSelection = null;
										
									}
									
									$scope.geoContainer.pureChildren = $scope.geoContainer.children
									if ($scope.geoContainer.endMultiple == 'Y'){
										if ($scope.geoContainer.children && $scope.geoContainer.children.length > 1){
											$scope.geoContainer.children=[{code:'',description:'Select All'}].concat($scope.geoContainer.children);
										}
									}
								}
							}
							if($scope.clearView){
								$scope.clearView();
							}
							
						};
						
						$scope.changeSelection = function(){
							if (angular.isArray($scope.geoContainer.childSelection) && 
									$scope.geoContainer.childSelection[0]==undefined && $scope.geoContainer.childSelection.length!=0){
								$scope.geoContainer.childSelection=$scope.geoContainer.pureChildren
							}
							
							if($scope.clearView){
								$scope.clearView();
							}
						}
					}
				};
			}]).directive('orc', ['$http','GDMCommon', function($http,GDMCommon) {
				return {
					restrict : 'E',
					templateUrl: 'app/views/templates/orc.html',
					controller: function($scope, $filter) {
						$scope.selectionItem =[];
						var match = false;
						$scope.addSelectAll = true;
						if(!angular.isUndefined($scope.addUpdateScreen) && $scope.addUpdateScreen){
							$scope.addSelectAll = false;
						}
						$scope.orcContainer.setSelection = function(selection){
							$scope.itemSelected(selection);
							if(!angular.isUndefined($scope.addUpdateScreen) && $scope.addUpdateScreen && $scope.displayUpdate){
								$scope.orcContainer.selection = selection;
							}
						}
						$scope.orcContainer.setCountrySelection = function(selection){
							if(!angular.isUndefined($scope.addUpdateScreen) && $scope.addUpdateScreen && $scope.displayUpdate){
								$scope.orcContainer.childSelection = selection;
							}
						}
						
						var orgRegion ={};
						angular.forEach(GDMCommon.orcStructure.commonOrcModel, function(orcModel){							
							if (angular.equals(orcModel.code,GDMCommon.orcStructure.orgcode)){
								orgRegion = orcModel;								
							}
						});
						//Remove orgRegion
						$scope.removeRegion =function(){
							if(!match){
								$scope.selectionItem =[];
								if($scope.addSelectAll){
									$scope.selectionItem[0]=({code:'',description:'Select All', children:[]});
								}
								angular.forEach(GDMCommon.orcStructure.commonOrcModel, function(orcModel){								
									if (!angular.equals(orcModel.code,orgRegion.code)){
										$scope.selectionItem.push(orcModel);									
									}
								});	
							}
						};
						//Add orgRegion
						$scope.addRegion =function(){
							if(!match){
								$scope.selectionItem =[];
								if($scope.addSelectAll){
									$scope.selectionItem[0]=({code:'',description:'Select All', children:[]});
								}
								angular.forEach(GDMCommon.orcStructure.commonOrcModel, function(orcModel){								
									$scope.selectionItem.push(orcModel);								
								});		
							}
						};
					
						$scope.regionPresent =GDMCommon.orcStructure.regionpresent;	
						
						if(!angular.isUndefined(GDMCommon.updownercode) && !angular.equals("",GDMCommon.addownercodes) && $scope.orclevel != "O"){
							$scope.selectionItem =[];
							if($scope.addSelectAll){
								$scope.selectionItem[0]=({code:'',description:'Select All', children:[]});
							}
							angular.forEach(GDMCommon.orcStructure.commonOrcModel, function(orcModel){
								for(var i=0; i< GDMCommon.updownercode.length; i++ ){	
									if (angular.equals(orcModel.code,GDMCommon.updownercode[i]) && !match){
										$scope.selectionItem.push(orcModel);
										match = true;
									}
								}
							});							
																		
						}
						if(!match && !angular.isUndefined(GDMCommon.addownercodes) && GDMCommon.addownercodes.length > 0 && $scope.orclevel != "O"){
							$scope.selectionItem =[];
							if($scope.addSelectAll){
								$scope.selectionItem[0]=({code:'',description:'Select All', children:[]});
							}
							angular.forEach(GDMCommon.orcStructure.commonOrcModel, function(orcModel){							
								for(var i=0; i< GDMCommon.addownercodes.length; i++ ){									
									if (angular.equals(orcModel.code,GDMCommon.addownercodes[i]) ){										
										$scope.selectionItem.push(orcModel);										
										match = true;
									}
								}								
							});								
						}
						if(!match){
							$scope.selectionItem =[];
							if($scope.addSelectAll){
								$scope.selectionItem[0]=({code:'',description:'Select All', children:[]});
							}
							if($scope.regionPresent && ($scope.orclevel=="R" || 
									(!angular.isUndefined($scope.orcContainer.hierarchySelection) && $scope.orcContainer.hierarchySelection.level=="R") )){
								$scope.removeRegion();
							}else{
								$scope.selectionItem = GDMCommon.orcStructure.commonOrcModel;
							}
						}																
						
						$scope.itemSelected = function(selection){
							if (angular.isArray(selection) && selection[0]==undefined && selection.length!=0){
								if($scope.addSelectAll){
									var selectAll = [];// $scope.selectionItem;
									selectAll.splice(0, 1);
									for(var i=1; i<$scope.selectionItem.length;i++){
										selectAll[i-1] = $scope.selectionItem[i];
									}
									$scope.orcContainer.selection=selectAll ; 
									//fill chilrden of all selected 
									$scope.orcContainer.children = [];
									for (var loop=0; loop<selectAll.length; loop++){
										$scope.orcContainer.children = $scope.orcContainer.children.concat(selectAll[loop].children);
									}
									$scope.orcContainer.children = $filter('orderBy')($scope.orcContainer.children, 'description');
								}
							}
							else if(selection != undefined){
								if($scope.addUpdateScreen && !angular.isUndefined($scope.orcContainer.hierarchySelection)
										&& $scope.orcContainer.hierarchySelection.level=="R"
											&& !GDMCommon.lockmap[selection.children[0].code]){
									alert("Please acquire a lock first or select other region.");
									return;
								}
								if (selection.children){
									if(GDMCommon.updownercode.length >0 ){
										var selectedchild =[];
										for(var i =0;i<selection.children.length;i++){
											for(var j=0; j< GDMCommon.updownercode.length; j++ ){									
												if (angular.equals(selection.children[i].code,GDMCommon.updownercode[j]) ){	
													selectedchild.push(selection.children[i]);
												}
											}										
										}
										$scope.orcContainer.children = selectedchild;
									}else if(GDMCommon.addownercodes.length >0 ){
										var selectedchild =[];
										for(var i =0;i<selection.children.length;i++){
											for(var j=0; j< GDMCommon.addownercodes.length; j++ ){									
												if (angular.equals(selection.children[i].code,GDMCommon.addownercodes[j]) ){	
													selectedchild.push(selection.children[i]);
												}
											}										
										}
										$scope.orcContainer.children = selectedchild;
									}
									else{
										$scope.orcContainer.children = selection.children;
									}
									//$scope.orcContainer.childSelection = selection.children[0];
								} else {
									$scope.orcContainer.children = [];
									for (var loop=0; loop<selection.length; loop++){
										$scope.orcContainer.children = $scope.orcContainer.children.concat(selection[loop].children);
									}
									$scope.orcContainer.children = $filter('orderBy')($scope.orcContainer.children, 'description');
									//$scope.orcContainer.childSelection = $scope.orcContainer.children[0];
								}
								$scope.orcContainer.childSelection = null;
								if($scope.clearSearchResult){
									$scope.clearSearchResult();
								}
								if($scope.clearView){
									$scope.clearView();	
								}	
							}
											
						};
						$scope.countrySelected = function(selection){							
							if($scope.clearView){
								$scope.clearView();
							}

						};
						$scope.organizationSelected = function(){
							if($scope.allowBrandGroups){
								$scope.allowBrandGroups();
							}
							if($scope.clearSearchResult){
								$scope.clearSearchResult();
							}
							if($scope.clearView){								
								$scope.clearView();
							}
						};
						$scope.regionRadioSelected = function(){
							$scope.removeRegion();
							if($scope.clearSearchResult){
								$scope.clearSearchResult();
							}
							if($scope.allowBrandGroups){
								$scope.allowBrandGroups();
							}
							if($scope.clearView){
								$scope.clearView();
							}							
						};
						$scope.countryRadioSelected = function(){
							$scope.addRegion();
							if($scope.allowBrandGroups){
								$scope.allowBrandGroups();
							}
							if($scope.clearSearchResult){
								$scope.clearSearchResult();
							}
							if($scope.clearView){								
								$scope.clearView();
							}							
						};
						
					}
				};
			}]).directive('fileUpload', function () {
			    return {
			        scope: true,        //create a new scope
			        link: function (scope, el, attrs) {
			            el.bind('change', function (event) {
			                var files = event.target.files;
			                //iterate files since 'multiple' may be specified on the element
			                for (var i = 0;i<files.length;i++) {
			                    //emit event upward
			                    scope.$emit("fileSelected", { file: files[i] });
			                }                                       
			            });
			        }
			    };
			}).directive('geohierarchyagog', ['$http','Login', function($http,Login) {
				return {
					restrict : 'E',
					templateUrl: 'app/views/templates/geoHierarchyAgog.html',
					controller: function($scope, $filter) {
						
						$scope.profile = Login.groupProfileFunctions;	
						var info = {}; 
						 info.profilelevel = Login.groupProfileFunctions.profilelevel;
						 var geoCode = Login.groupProfileFunctions.geoCode
						 info.ctryCodes = Login.groupProfileFunctions.ctryCodes
						var request = {
			    				 method: 'POST',
			    				 url: '/services/epricer/v2/settings/api/GeoHierarchy/geoAgog',
			    				 headers: {
			    				   'Content-Type': 'application/json'
			    				 },
			    				 data: geoCode
			    				}
						
						 $http(request).success(function(response) {
							$scope.selectionItem = response;
							$scope.selection = $scope.selectionItem[0];
							var agogParentMap = {};
							for (var loop=0; loop < response.length; loop++){
								if(response[loop].levelList){
									for (var loop2=0; loop2 < response[loop].levelList.length; loop2++){
										if(response[loop].levelList[loop2]){
											var parentCode = response[loop].levelList[loop2].parentCode;
											if(response[loop].levelList[loop2].childrenList){
												for (var loop3=0; loop3 < response[loop].levelList[loop2].childrenList.length; loop3++){
													agogParentMap[response[loop].levelList[loop2].childrenList[loop3].code] = parentCode;
												}
											}
										}
									}
								}
							}
							if ($scope.agogContainer){
								$scope.agogContainer.agogParentMap = agogParentMap;
							}
						});

						$scope.levelFilter = function (level) {
						    if ($scope.selection == undefined) {
						        return false;
						    }
						    return level.level <= $scope.selection.level;
						};
						
						$scope.prepareOptions = function(level, parentSelections){
							var optionList = [];
							angular.forEach(level.levelList, function(listElement){
								var parentElementMap={};
								angular.forEach(parentSelections, function(parentElements){
									parentElementMap[parentElements]=true;
								});
								if (parentElementMap[listElement.parentCode] == true){
									angular.forEach(listElement.childrenList, function(child){
										optionList.push({'code':child.code, 'description':child.description});
									});
								}
							});
							
							return optionList = $filter('orderBy')(optionList, 'description');
						};
						
						$scope.changeSelection = function (levleIndex, isInit) {
							var loop = levleIndex+1;
							while ($scope.agogContainer.availableOptions[loop]){
								$scope.agogContainer.availableOptions[loop]=$scope.prepareOptions($scope.selectionItem[loop], $scope.agogContainer.selectionList);
								loop++;
							}
							if(!isInit){
								$scope.agogContainer.selectionList.length = levleIndex+1;
								if($scope.clearView){
									$scope.clearView();
								}
							}
						};
						
						$scope.prepareCountryCodeMap = function(){
							var countryCodeMap = {};
							if($scope.selectionItem){
								angular.forEach($scope.selectionItem, function(selectionObject){
									if(selectionObject.levelList){
										angular.forEach(selectionObject.levelList, function(levelObject){
											if(levelObject.childrenList){
												angular.forEach(levelObject.childrenList, function(childObject){
													countryCodeMap[childObject.code] = childObject.description;
												});
											}
										});
									}
								});
							}
							
							return countryCodeMap;
						};
						
						$scope.initSelection = function (level) {
							if(!level) return;
							$scope.selection = $scope.selectionItem[level];
							$scope.agogContainer.selectionList=($scope.initList) ? $scope.initList : $scope.agogContainer.selectionList;
							$scope.resetSelection($scope.selectionItem[level], true);
						};
						
						$scope.resetSelection = function (level, isInit) {
						    $scope.agogContainer.level=level;
						    $scope.agogContainer.selectionList = $scope.agogContainer.selectionList.slice(0,level.level+1);
						    $scope.getOwnerList();
						    if(!isInit && $scope.clearView){
								$scope.clearView();
							}
						};
						
						$scope.getSelectedOwner = function (){
							var level = $scope.agogContainer.level.level;
							if($scope.agogContainer.selectionList.length >= level+1){
								return $scope.agogContainer.selectionList[level];
							}
						};

						$scope.getOwnerList = function (ownerCode, level) {

							if (!level){
								level = Number($scope.agogContainer.level.level);
							}

							if (!ownerCode){
								if($scope.agogContainer.selectionList.length >= level+1){
									ownerCode = $scope.agogContainer.selectionList[level];
								}
							}

							var ownerList = [];
							ownerList[ownerList.length] = ownerCode;
							
							while (level < $scope.selectionItem.length-1){
								level++;
								ownerList = ownerList.concat($scope.getChildren (ownerList, level));
							}
							$scope.agogContainer.ownerList = ownerList;
						};
						
						$scope.getChildren = function (ownerCodes, level){
							var objLevel = $scope.selectionItem[level];
							var children=[];
							var ownerMap = {};
							angular.forEach (ownerCodes, function(owner){
								ownerMap[owner] = true;
							});
							
							if (objLevel && objLevel.levelList){
								angular.forEach(objLevel.levelList, function (levelListObj){
									if (ownerMap[levelListObj.parentCode]){
										angular.forEach(levelListObj.childrenList, function(childObj){
											children[children.length] = childObj.code;
										});
									}
								});
							}
							return children;
						};
					}
				};
			}]).directive('busyIndicatorSmall', function(){
				return {
					restrict : 'E',
					template : '<p class="ibm-spinner-small" href="#">&nbsp</p>', 
				};
			}).directive('busyIndicatorLarge', function(){
				return {
					restrict : 'E',
					link: function (scope, element, attrs) {
                        var waitMsg = attrs["waitMsg"]
                        if (angular.isUndefined(waitMsg) || waitMsg==null || waitMsg==''){
                        	waitMsg = 'Loading'
                        }

                        scope.waitMsg = waitMsg
                    },
					restrict : 'E',
					template : '<br/><br/><p style="text-align:center;" id="loading" class="ibm-spinner-large" href="#"><span style="float: left; padding-top: 13px; width: 100%;"><strong>{{waitMsg}}&nbsp;&nbsp;</strong></span></p>',
				};
			}).directive('ibmPagination', function($sce, $filter, $cookieStore) {
				  link = function(scope, element, attrs) {
					  scope.$watch('paginationInfo.data', function(){
						  if(!angular.isUndefined(scope.paginationInfo.data)){
							  if(!scope.paginationInfo.currentPage)
							  	scope.paginationInfo.currentPage= 1;
							  scope.update();
						  } else{
							  scope.paginationInfo.currentPageStart = -1;
							  scope.paginationInfo.currentPageEnd = -1;
							  scope.paginationInfo.dataSize = 0;
							  scope.pageContent = $sce.trustAsHtml("<p class='ibm-spinner-large' href='#'>&nbsp</p>");
						  }
					  }, true);
					  
					  scope.$watch('paginationInfo.pageSize', function(){
						  $cookieStore.remove("pageSize");
						  $cookieStore.put("pageSize", scope.paginationInfo.pageSize);
						  scope.update();
					  });
					  
					  scope.$watch('paginationInfo.filter', function(){
						  scope.update();
					  });
					  
					  
					  
		 			  scope.update = function() {
		 				 var filteredData;
		 				  if(angular.isUndefined(scope.paginationInfo.filter)){
		 					  filteredData = scope.paginationInfo.data 
		 				  } else{
		 					  filteredData = $filter('filter')(scope.paginationInfo.data, scope.paginationInfo.filter);

		 				  };
		 				  
	 					  
	 					  if(!angular.isUndefined(filteredData )){
	 						 scope.paginationInfo.dataSize = filteredData.length;
	 					  }
						  

						  scope.paginationInfo.currentPageStart = scope.paginationInfo.pageSize * (scope.paginationInfo.currentPage - 1);
						  scope.paginationInfo.currentPageEnd = (scope.paginationInfo.pageSize * scope.paginationInfo.currentPage - 1);
						  if (scope.paginationInfo.currentPageEnd + 1 > scope.paginationInfo.dataSize) {
							  scope.paginationInfo.currentPageEnd = scope.paginationInfo.dataSize - 1;
						  }
//						  if(!angular.isUndefined(scope.paginationInfo.renderHeader)){
//							  var records = scope.paginationInfo.renderHeader();
//						  }
				      
						  scope.paginationInfo.init();
						  
						  for (var i = scope.paginationInfo.currentPageStart; i <= scope.paginationInfo.currentPageEnd; i++) {
							  scope.paginationInfo.updateDisplayList(scope.paginationInfo.data[i]);
						  }
					  
//						  scope.pageContent = $sce.trustAsHtml(records);
					  },


					  scope.next = function() {
						  if(scope.paginationInfo.dataSize == 0)
							  return;
						  if (scope.paginationInfo.currentPage < scope.paginationInfo.dataSize / scope.paginationInfo.pageSize) {
							  scope.paginationInfo.currentPage++;
						  }
						  scope.update();
					  },

					  scope.previous = function() {
						  if(scope.paginationInfo.dataSize == 0)
							  return;
						  if (scope.paginationInfo.currentPage > 1) {
							  scope.paginationInfo.currentPage--;
							  scope.update();
						  }
					  }
				  }
				  return {
					  restrict: 'E',
					  templateUrl : 'app/views/templates/pagintaion.htm',
					  scope: {
						  paginationInfo: "=options"
					  },
					  link: link
				  }
			}).directive('overlay', function($sce) {
				 link = function(scope, element, attrs) {
					  scope.$watch('user', function(){
						  /*if(angular.isDefined(scope.user.firstname)){
							  alert('changed - '+scope.user.firstname);
						  }*/
						  //update();
					  }, true);
					  
					  openOverlay = function(userId) {
						  alert(userId);
					  }
				 }
				 return {
					  restrict: 'E',
					  templateUrl : 'app/views/templates/overlay.htm',
					  scope: {
						  user: '=user'
					  },
					  link : link
				 }	  
			
			}).directive('overlayManageDis', function($sce) {
				 link = function(scope, element, attrs) {
					  scope.$watch('disDetail', function(){
					  }, true);
					  
					  openOverlay = function() {
						  alert("Test");
					  }
				 }
				 return {
					  restrict: 'E',
					  templateUrl : 'app/views/templates/overlayManageDis.htm',
					  scope: {
						  disDetail: '=disDetail'
					  },
					  link : link
				 }	  
			
			});
})