app.config(function ($stateProvider) {
    $stateProvider
        .state('checkout', {
            url : '/checkout',
            templateUrl : 'js/checkout/checkout.html',
            controller: 'CheckOutController'
        }).state('checkout.paid', {
            url : '/thank-you',
            templateUrl : 'js/checkout/paid.html',
        });
});

app.controller('CheckOutController', function ($scope, AuthService, $state, CartFactory) {
    $scope.cart = CartFactory.getCart();
    $scope.paid = false;
    $scope.order;

    $scope.processPayment = function() {
        console.log("processing payment...");
        AuthService.getLoggedInUser()
            .then(function(user) {
                var cartToCreate = {
                    listitems : $scope.cart.listitems.map(function(cartItem) {
                        return {
                            item : cartItem.item._id,
                            quantity : cartItem.quantity
                        };
                    })
                };

                if (user) {
                    cartToCreate.user = user._id;
                }

                return cartToCreate;
            })
            .then (function (cartToCreate) {
                return CartFactory.createNewOrder(cartToCreate);
            })
            .then(function (newOrder) {
                console.log("response, ",newOrder);

                newOrder.status = 2;
                $scope.paid = true;

                return CartFactory.updateOrder(newOrder);
            })
            .then(function (paidOrder){
                //recieved paid order confirmation from back end

                $scope.cart = angular.extend({}, paidOrder, $scope.cart);
                console.log("paid Order = ", paidOrder);
                console.log("scope cart = ", $scope.cart);
                $scope.order = $scope.cart;

                CartFactory.clearCart();
                $state.go("checkout.paid");
            })
            .catch(function (err) {
                console.log("error in order creation, ", err);
            });
    };

    function init() {
        if (!$scope.cart.listitems.length) return;
        if ($scope.cart._id) return;
        
    }

    init();
});
