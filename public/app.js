var app = angular.module('invoicing', ['ui.router','ngPrint'])

app.config(['$stateProvider', '$urlRouterProvider',
           function (stateProvider, urlRouterProvider) {
             
             stateProvider
               .state('addRec', {
                 url: '/addrecord',
                 templateUrl: '/addrecord.html',
                 controller: 'InvoiceCtrl',
               })
               .state('home', {
                 url: '/home',
                 templateUrl: '/home.html',
                 controller: 'InvoiceCtrl',
                 resolve: {
                    recordPromise: ['records', function(records) {
                      console.log($('#main_search').val());
                      //console.log($scope.nameFilter);
                      return records.getAll();
                      
                    }]
                 }
               })
               .state('landing', {
                 url: '/landing',
                 templateUrl: '/landing.html',
                 controller: 'InvoiceCtrl',
               })
               .state('records', {
                 url:'/records/:id',
                 templateUrl: 'records.html',
                 controller: 'RecordsCtrl',
                 resolve: {
                   record: ['$stateParams', 'records', function($stateParams, records) {
                      return records.get($stateParams.id);
                    }]
                 }
               })
               .state('login', {
                 url: '/login',
                 templateUrl: '/login.html',
                 controller: 'AuthCtrl',
                 onEnter: ['$state', 'auth', function($state, auth){
                    if(auth.isLoggedIn()){
                    $state.go('landing');
                 }}]
               })
               .state('register', {
                 url: '/register',
                 templateUrl: '/register.html',
                 controller: 'AuthCtrl',
                 onEnter: ['$state', 'auth', function($state, auth){
                    if(auth.isLoggedIn()){
                    $state.go('landing');
                 }}]
               });
               
             
             urlRouterProvider.otherwise('landing');
           }]
);
// The default logo for the invoice
app.constant('DEFAULT_LOGO', 'http://silfratech.com/wp-content/uploads/2016/06/silfra-logo-150.png')

// The invoice displayed when the user first uses the app
app.constant('DEFAULT_INVOICE', {
  tax: 0.0,
  invoice_number: 0,
  customer_info: {
    name: '',
    web_link: '',
    address1: '',
    address2: '',
    postal: ''
  },
  company_info: {
    name: '',
    web_link: '',
    address1: '',
    address2: '',
    postal: ''
  },
  items:[
    { qty: 0, description: '', cost: 0.0, tax: 0.0, total: 0.0, subtotal: 0.0, grandtotal: 0.0 }
  ]
})

// Service for accessing local storage
app.service('LocalStorage', [function() {

  var Service = {};


  // Checks to see if an invoice is stored
  var hasInvoice = function() {
    return !(localStorage['invoice'] == '' || localStorage['invoice'] == null);
  };

  // Returns a stored invoice (false if none is stored)
  Service.getInvoice = function() {
    if (hasInvoice()) {
      return JSON.parse(localStorage['invoice']);
    } else {
      return false;
    }
  };

  Service.setInvoice = function(invoice) {
    localStorage['invoice'] = JSON.stringify(invoice);
  };

  // Clears a stored logo
  Service.clearLogo = function() {
    localStorage['logo'] = '';
  };

  // Clears a stored invoice
  Service.clearinvoice = function() {
    localStorage['invoice'] = '';
  };

  // Clears all local storage
  Service.clear = function() {
    localStorage['invoice'] = '';
    Service.clearLogo();
  };

  return Service;

}])

app.service('Currency', [function(){

  var service = {};

  service.all = function() {
    return [
      {
        name: 'British Pound (£)',
        symbol: '£'
      },
      {
        name: 'Canadian Dollar ($)',
        symbol: 'CAD $ '
      },
      {
        name: 'Euro (€)',
        symbol: '€'
      },
      {
        name: 'Indian Rupee (₹)',
        symbol: '₹'
      },
      {
        name: 'Norwegian krone (kr)',
        symbol: 'kr '
      },
      {
        name: 'US Dollar ($)',
        symbol: '$'
      }
    ]
  }

  return service;
  
}])

app.factory('records', ['$http','auth', function($http, auth) {
  var o = {
    records: [],
    allComments: []
  };
  
  o.getAll = function () {
    return $http.get('/records').success(function(data){
      angular.copy(data, o.records);
  })};
  
  o.create = function (record) {
    console.log(record);
    
    return $http.post('/records', record, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
    o.records.push(data);
    })
  };
  
  o.update = function (id) {
   return $http.get('/records/' + id)
    .then(function(res){
            var entry = {};
            console.log(res.record);
            entry.invoice_number = res.record.invoice.invoice_number;
            entry.gst_number = res.record.invoice.gst_number;
            entry.mou_number = res.record.invoice.mou_number;
            entry.aut_number = res.record.invoice.aut_number;
            entry.logo_url = res.record.invoice.logo_url; 
            entry.tax = res.record.invoice.tax; 
            entry.customer_info = res.record.invoice.customer_info; 
            entry.name = res.record.invoice.customer_info.name;
            entry.web_link = res.record.invoice.customer_info.web_link;
            entry.address1 = res.record.invoice.customer_info.address1;
            entry.address2 = res.record.invoice.customer_info.address2;
            entry.postal = res.record.invoice.customer_info.postal;
            entry.name_c = res.record.invoice.company_info.name_c;
            entry.web_link_c = res.resort.invoice.company_info.web_link_c;
            entry.address1_c = res.record.invoice.company_info.address1_c;
            entry.address2_c = res.record.invoice.company_info.address2_c;
            entry.postal_c = res.record.invoice.company_info.postal_c;
            entry.postal_c = res.record.invoice.company_info.postal_c;
              entry.qty = res.record.invoice.items.qty;
              entry.cgst = res.record.invoice.items.cgst;
              entry.igst = res.record.invoice.items.igst;
              entry.export = res.record.invoice.items.export;
              entry.description = res.record.invoice.items.description; 
              entry.cost = res.record.invoice.items.cost;
              entry.total = res.record.invoice.items.total;
              entry.subtotal = res.record.invoice.items.subtotal;
              entry.grandtotal = res.record.invoice.items.grandtotal;
    
            
            return res.record;
    });
  }
  
  o.upvote = function (record) {
    console.log(auth.getToken());
     return $http.put('/records/' + record._id + '/upvote', {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    })
    .success(function(data){
      record.upvotes += 1;
    });
  };
  
  o.get = function (id) {
    return $http.get('/records/' + id)
    .then(function(res){
            var entry = {};
            console.log(res.data);
            entry.entryid = res.data._id;
            entry.bizname = res.data.bizname;
            angular.forEach(res.data.comments, function(comment){
              console.log(comment);
              entry.author = comment.author;
              entry.body = comment.body;
              entry.score = comment.score;
              entry.time = comment.time;
              entry.upvotes = comment.upvotes;
              o.allComments.push(entry);
            });
            //o.allComments.push(res.data.comments);
            //console.log(o.allComments);
            return res.data;
    });
  }
  
  o.addComment = function (id, comment) {
    return $http.post('/records/' + id + '/comments', comment, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    });
  }
  
  o.upvoteComment = function(record, comment) {
    console.log(auth.getToken());
    return $http.put('/records/' + record._id + '/comments/'+ comment._id + '/upvote', null, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    })
    .success(function(data){
      comment.upvotes += 1;
    });
  };
  
  return o;
}]);

app.factory('auth', ['$http', '$window', function ($http, $window) {
  var auth = {};
  
  auth.saveToken = function (token) {
    $window.localStorage['flapper-news-token'] = token;    
  };
  
  auth.getToken = function () {
    return $window.localStorage['flapper-news-token'];
  };
  
  auth.isLoggedIn = function () {
    var token = auth.getToken () ;
    if (token) {
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;      
    } else {
      return false;
    }
  };
  
  auth.currentUser = function () {
    if (auth.isLoggenIn) {
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload.username;
    }        
  };
  
  auth.register = function(user) {
    return $http.post('/register', user).success(function (data) {
      auth.saveToken(data.token);
    });
  };
  
  auth.login = function(user) {
    return $http.post('/login',user).success(function(data) {
      auth.saveToken(data.token);
    });
  };
  
  auth.logout = function(){
    $window.localStorage.removeItem('flapper-news-token');
  };
  
  return auth;
}]);


// Main application controller
app.controller('InvoiceCtrl', ['$scope', '$http', 'DEFAULT_INVOICE', 'DEFAULT_LOGO', 'LocalStorage', 'records', 'auth', 'Currency',
  function($scope, $http, DEFAULT_INVOICE, DEFAULT_LOGO, LocalStorage, records, auth, Currency) {
    
    //console.log(records);
    $scope.range = function(min, max, step){
    step = step || 1;
    var input = [];
    for (var i = min; i <= max; i += step) input.push(i);
    return input;
     };
  // Set defaults
  $scope.currencySymbol = '₹';
  $scope.logoRemoved = false;
  $scope.printMode   = false;

  (function init() {
    // Attempt to load invoice from local storage
    !function() {
      var invoice = LocalStorage.getInvoice();
      $scope.invoice = invoice ? invoice : DEFAULT_INVOICE;
    }();

   

    $scope.availableCurrencies = Currency.all();

  })()
  // Adds an item to the invoice's items
  $scope.addItem = function() {
    $scope.invoice.items.push({ qty:0, cost:0, description:"", tax:0 });
  }

  // Toggle's the logo
  $scope.toggleLogo = function(element) {
    $scope.logoRemoved = !$scope.logoRemoved;
    LocalStorage.clearLogo();
  };

  // Triggers the logo chooser click event
  $scope.editLogo = function() {
    // angular.element('#imgInp').trigger('click');
    document.getElementById('imgInp').click();
  };

  $scope.printInfo = function() {
    window.print();
  };

  // Remotes an item from the invoice
  $scope.removeItem = function(item) {
    $scope.invoice.items.splice($scope.invoice.items.indexOf(item), 1);
  };

  // Calculates the sub total of the invoice
  $scope.invoiceSubTotal = function() {
    var subtotal = 0.00;
    angular.forEach($scope.invoice.items, function(item, key){
      subtotal += (item.qty * item.cost);
      item.subtotal = subtotal;
    });
    return subtotal;
  };
    
     // Calculates the sub total of the invoice
  $scope.Total = function() {
    var total = 0.00;
    angular.forEach($scope.invoice.items, function(item, key){
      total = (item.qty * item.cost);
      item.total = total;
    });
    return total;
  };

  // Calculates the tax of the invoice
  $scope.calculateTax = function() {
    var tax = 0.00;
    var tax2 = 0.00;
    //var tax3 = 0.00;
     
    angular.forEach($scope.invoice.items, function(item, key){
      tax = (($scope.invoice.cgst * $scope.invoiceSubTotal())/100);
      tax2 = (($scope.invoice.igst * $scope.invoiceSubTotal())/100);
      //tax3 = (($scope.invoice.export * $scope.invoiceSubTotal())/100);
      item.tax = tax+tax2;
      
    });
    return tax+tax2;
    
  };
    
    $scope.calculateTax2 = function() {
    //var tax = 0.00;
    var tax3 = 0.00;
    //var tax3 = 0.00;
     
    angular.forEach($scope.invoice.items, function(item, key){
          
      tax3 = (($scope.invoice.export * $scope.invoiceSubTotal())/100);
      item.tax = tax3;
      
    });
    return tax3;
    
  };

  // Calculates the grand total of the invoice
  $scope.calculateGrandTotal = function() {
    //saveInvoice();
     var grandtotal = 0.00;
    angular.forEach($scope.invoice.items, function(item, key){
     
      grandtotal = ($scope.calculateTax() + $scope.invoiceSubTotal());
      item.grandtotal = grandtotal;
    });
    return grandtotal;
  };
    
     $scope.calculateGrandTotal2 = function() {
    //saveInvoice();
     var grandtotal = 0.00;
    angular.forEach($scope.invoice.items, function(item, key){
     
      grandtotal = ($scope.calculateTax2() + $scope.invoiceSubTotal());
      item.grandtotal = grandtotal;
    });
    return grandtotal;
  };

  // Clears the local storage
  $scope.clearLocalStorage = function() {
    var confirmClear = confirm('Are you sure you would like to clear the invoice?');
    if(confirmClear) {
      LocalStorage.clear();
      setInvoice(DEFAULT_INVOICE);
    }
  };

  // Sets the current invoice to the given one
  var setInvoice = function(invoice) {
    $scope.invoice = invoice;
    //saveInvoice();
  };

  // Reads a url
  var readUrl = function(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById('company_logo').setAttribute('src', e.target.result);
        LocalStorage.setLogo(e.target.result);
      }
      reader.readAsDataURL(input.files[0]);
    }
  };

  // Saves the invoice in local storage
  var saveInvoice = function() {
    
    //LocalStorage.setInvoice($scope.invoice);
    //console.log($scope.invoice.items);
   // $scope.addRecord().records.invoice.items
  };


    
    console.log("main");
     $scope.tab = 1;
    $scope.setTab = function(newTab){
      $scope.tab = newTab;
    };

    $scope.isSet = function(tabNum){
      return $scope.tab === tabNum;
    };
  
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.records = records.records;
    
    $scope.allComments = records.allComments;
    angular.forEach($scope.records, function(record){
      console.log(record);
      //console.log(records.get(record._id).value);
    });
    $scope.records = records.records;
    console.log($scope.invoice);
    
    $scope.addRecord = function() {
      //console.log("addRecord");
      
      if(!$scope.invoice_number || $scope.invoice_number === '') return;
      console.log("Inserted");
      
      records.create({
        invoice : {
        invoice_number: $scope.invoice_number,
        gst_number: $scope.gst_number,
        mou_number: $scope.mou_number,
        aut_number: $scope.aut_number,
        logo_url: $scope.logo_url,
        currencySymbol: $scope.currency,
          customer_info: {
            name: $scope.name,
            web_link: $scope.web_link,
            address1: $scope.address1,
            address2: $scope.address2,
            postal:$scope.postal
          },
          company_info: {
            name_c: $scope.name_c,
            web_link_c: $scope.web_link_c,
            address1_c: $scope.address1_c,
            address2_c: $scope.address2_c,
            postal_c:$scope.postal_c
          },
         items: $scope.invoice.items
           }
          
        });
      console.log($scope.records);
      $scope.tax="";
      $scope.invoice_number="";
      $scope.gst_number="";
      $scope.mou_number="";
      $scope.aut_number="";
      $scope.logo_url="";
      $scope.currency="";
      $scope.name="";
      $scope.web_link="";  
      $scope.address1="";
      $scope.address2="";  
      $scope.postal=""; 
      $scope.name_c="";
      $scope.web_link_c="";  
      $scope.address1_c="";
      $scope.address2_c="";  
      $scope.postal_c=""; 
      $scope.qty="0";
      $scope.description="";
      $scope.cost="0.00";
      $scope.total="";
      $scope.subtotal="";
      $scope.grandtotal="";
      
      
      
      
    }
    
    $scope.updateRecord = function(record) {
      //console.log("addRecord");
      
      if(!$scope.invoice_number || $scope.invoice_number === '') return;
      console.log("Inserted");
      
      records.update({
        invoice : {
        invoice_number: $scope.invoice_number,
        gst_number: $scope.gst_number,
        mou_number: $scope.mou_number,
        aut_number: $scope.aut_number,
        logo_url: $scope.logo_url,
          customer_info: {
            name: $scope.name,
            web_link: $scope.web_link,
            address1: $scope.address1,
            address2: $scope.address2,
            postal:$scope.postal
          },
          company_info: {
            name_c: $scope.name_c,
            web_link_c: $scope.web_link_c,
            address1_c: $scope.address1_c,
            address2_c: $scope.address2_c,
            postal_c:$scope.postal_c
          }
           }
          
        });
      console.log($scope.records);
      $scope.tax="";
      $scope.invoice_number="";
      $scope.gst_number="";
      $scope.mou_number="";
      $scope.aut_number="";
      $scope.logo_url="";
      $scope.name="";
      $scope.web_link="";  
      $scope.address1="";
      $scope.address2="";  
      $scope.postal=""; 
      $scope.name_c="";
      $scope.web_link_c="";  
      $scope.address1_c="";
      $scope.address2_c="";  
      $scope.postal_c=""; 
      $scope.qty="0";
      $scope.description="";
      $scope.cost="0.00";
      $scope.total="";
      $scope.subtotal="";
      $scope.grandtotal="";
      
      
      
      
    }
    
     $scope.incrementUpvote = function (record) {
      console.log(record);
      records.upvote(record);
    }
    
    

}]);

app.controller('NavCtrl', function ($scope, $location) {
    $scope.isCollapsed = true;
    $scope.$on('$routeChangeSuccess', function () {
        $scope.isCollapsed = true;
    });
  
    $scope.getClass = function (path) {
    if(path === '/home') {
        if($location.path() === '/home') {
            return "active";
        } else {
            return "";
        }
    }
 
    if ($location.path().substr(0, path.length) === path) {
        return "active";
    } else {
        return "";
    }
}
    
});

app.directive("clickToEdit", function($timeout) {
  return {
    require: "ngModel",
    scope: {
      model: "=ngModel",
      type: "@type"
    },
    replace: true,
    transclude: false,
    // includes our template
    template:
      '<div class="templateRoot">' +
        '<div class="hover-edit-trigger" title="click to edit">' +
        '<div class="hover-text-field" ng-show="!editState" ng-click="toggle()">{{model}}<div class="edit-pencil glyphicon glyphicon-pencil"></div></div>' +
        '<input class="inputText" type="text" ng-model="localModel" ng-enter="save()" ng-show="editState && type == \'inputText\'" />' +
        "</div>" +
        '<div class="edit-button-group pull-right" ng-show="editState">' +
        '<div class="glyphicon glyphicon-ok"  ng-click="save()"></div>' +
        '<div class="glyphicon glyphicon-remove" ng-click="cancel()"></div>' +
        "</div>" +
        "</div>",
    link: function(scope, element, attrs) {
      scope.editState = false;

      // make a local ref so we can back out changes, this only happens once and persists
      scope.localModel = scope.model;

      // apply the changes to the real model
      scope.save = function() {
        scope.model = scope.localModel;
        scope.toggle();
      };

      // don't apply changes
      scope.cancel = function() {
        scope.localModel = scope.model;
        scope.toggle();
      };

      /*
             * toggles the editState of our field
             */
      scope.toggle = function() {
        scope.editState = !scope.editState;

        /*
                 * a little hackish - find the "type" by class query
                 *
                 */
        var x1 = element[0].querySelector("." + scope.type);

        /*
                 * could not figure out how to focus on the text field, needed $timout
                 * http://stackoverflow.com/questions/14833326/how-to-set-focus-on-input-field-in-angularjs
                 */
        $timeout(function() {
          // focus if in edit, blur if not. some IE will leave cursor without the blur
          scope.editState ? x1.focus() : x1.blur();
        }, 0);
      };
    }
  };
});


app.controller('RecordsCtrl', [
  
  '$scope', 'records', 'record', 'auth', 
  function ($scope, records, record, auth) {
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.record= record;
    $scope.allComments = [];
    console.log(records);
    console.log(record);
    $scope.addComment = function () {
      if ($scope.body === "") {return;};
      records.addComment(record._id, {
          body: $scope.body,
          author: 'user',
          score:$scope.score,
          time: new Date(),
          }).success(function(comment) {
              console.log(comment);
              $scope.record.comments.push(comment);
              records.allComments.push(comment);
              $scope.allComments = records.allComments;
          });
      $scope.allComments = records.allComments;
      $scope.body = '';
      
    }
    
    $scope.incrementUpvotes = function(comment){
      console.log(comment);
      records.upvoteComment(record, comment);
    };
    
  }]  
);

app.controller('AuthCtrl', ['$scope', '$state', 'auth', function($scope, $state, auth) {
  $scope.user = {};
  
  $scope.register = function () {
    auth.register($scope.user).error(function(error) {
      $scope.error = error;
    }).then(function() {
      $state.go('landing');
    });
  };
  
  $scope.login = function(){
    auth.login($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('landing');
    });
  };
  
}]);

app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logout = auth.logout;

}]);
