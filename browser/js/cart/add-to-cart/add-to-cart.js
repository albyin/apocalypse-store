app.directive('addToCart', function (CartFactory) {
    return {
        restrict : 'E',
        templateUrl : 'js/cart/add-to-cart/add-to-cart.html',
        scope : {
            item: '='
        },
        link : function(scope, element, attr) {
            scope.addQuant = '';
            scope.addToCart = function() {
                CartFactory.pushCartItem(scope.item, scope.addQuant);
                scope.addQuant = ""; //reset addQuant dropdown selection to default
            };
        }
    };
});