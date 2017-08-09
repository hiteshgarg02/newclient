
client-data-inventory (AngularJS Project)

Client Inventory is project that can utilisied by the companies requiring to maintain the crutial data of there client's and require a user friendly GUI that can be effectively used by there worker's. The Project is being created over AngularJS following the MVC Model to ease the development and maintenance of the project.This demo project will also show the usage of filters,directives and service call in angularjs framework. The data sent and retrieved will be in the form of JSON(Java Script Object Notation) and will be helpful to handle Restful services.

Also used the "tinymce" plugin to incorporate the features of rich text editor which enhances the performance of the application too to handle the information user wants to save for future reference. For sending mails, service is being added that can be useful to the one's requiring this feature in there application.

This is a single page application where on the basis of the selection made by the user the panel will get displayed.

The application is being divided into three section maintain the client inventory information.

    View client data -> We can search the data on the basic of the country being selected in the dropdown section. -> Countries are coming from the JSON file , using the below mentioned code. We can put the service call here to access the data from database when required.

         $http.get("app/mock-json/country.json").success(function(response) {
     		$scope.countryselection = response;
     		}).error(function (errorMessage){
     			$scope.errorMessage = errorMessage; 
     		});

-> The screen also provides user the facility to search over the table records depending upon the search keyword entered in the filter text area. (It has been done by using filter directive of angular. Ref. : viewclientinfo.html)

    Add client data -> This section is being used to add the client data and save it in database. -> TinyMCE is being used for rich text editor over the section for saving comments for the client by the user.

TinyMCE is a JavaScript library for platform independent 'WYSIWYG' or rich text editing. It is released as open source under the LGPL. https://www.tinymce.com/

    Mail Client -> This section will be used to email the client and TinyMCE is again used to have the rich text editing feature over the section.

    Controller's will hold the controlling logic for each view(html) in the application.

