var app = angular.module('invoicing', ['ui.router'])

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
             .state('records_edit', {
                 url:'/records/:id',
                 templateUrl: 'edit.html',
                 controller: 'RecordsCtrl',
                 resolve: {
                   record: ['$stateParams', 'records', function($stateParams, record) {
                      return record.get($stateParams.id);
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
    { qty: 0, description: '', cost: 0.0 }
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
    //console.log("create record");
    return $http.post('/records', record, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
    o.records.push(data);
    })
  };
  
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
            console.log(o.allComments);
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
  $scope.currencySymbol = '$';
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
    $scope.invoice.items.push({ qty:0, cost:0, description:"" });
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
    var total = 0.00;
    angular.forEach($scope.invoice.items, function(item, key){
      total += (item.qty * item.cost);
    });
    return total;
  };

  // Calculates the tax of the invoice
  $scope.calculateTax = function() {
    return (($scope.invoice.tax * $scope.invoiceSubTotal())/100);
  };

  // Calculates the grand total of the invoice
  $scope.calculateGrandTotal = function() {
    saveInvoice();
    return $scope.calculateTax() + $scope.invoiceSubTotal();
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
    saveInvoice();
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
    LocalStorage.setInvoice($scope.invoice);
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
      console.log(records.get(record._id).value);
    });
    $scope.records = records.records;
    console.log($scope.allComments);
    
    $scope.addRecord = function() {
      //console.log("addRecord");
      
      if(!$scope.invoice_number || $scope.invoice_number === '') return;
      console.log("Inserted");
      
      records.create({
        invoice : {
        tax: $scope.tax,
        invoice_number: $scope.invoice_number,
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
          },
          items: [
            {
              qty: $scope.qty, 
              description: $scope.description, 
              cost: $scope.cost
            }
          ] }
          
        });
      $scope.tax="";
      $scope.invoice_number="";
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
      $scope.qty="";
      $scope.description="";
      $scope.cost="";
      
      
      
    }
    
     $scope.incrementUpvote = function (record) {
      console.log(record);
      records.upvote(record);
    }
    
    

}]);

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
