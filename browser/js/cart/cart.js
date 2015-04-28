app.config(function ($stateProvider) {
    $stateProvider
        .state('cart', {
            url : '/cart',
            templateUrl : 'js/cart/cart.html',
            controller: 'CartController',
            controllerAs : 'CartCtrl'
        });
});

app.controller('CartController', function ($scope, AuthService, $state, CartFactory) {
    $scope.cart = CartFactory.getCart();

    $scope.clearCart = function() {
        CartFactory.clearCart();
    };

    $scope.removeItem = function(item_id) {
        CartFactory.removeItem(item_id);
    };

    $scope.updateQuant = function(id, newQuant) {
        CartFactory.updateQuant(id, newQuant);
    };
});

app.factory('CartFactory', function($http, $localStorage) {
    var cart = $localStorage.$default({
        listitems : [],
        totalPrice  : 0
    });

    function cartListIndexOf(myArray, property, searchTerm) {
        for(var i = 0, len = myArray.length; i < len; i++) {
            // console.log("searching ", myArray[i].item[property], "for ", searchTerm);
            if (myArray[i].item[property] === searchTerm) return i;
        }
        return -1;
    }

    function recalcTotalPrice(){
        cart.totalPrice = 0;
        for (var i = 0; i < cart.listitems.length; i++){
            cart.totalPrice += cart.listitems[i].quantity * cart.listitems[i].item.price;
        }
    }

    function pushCartItem(listItem, quantity) {
        if (!quantity) return;

        var existingItemIdx = cartListIndexOf(cart.listitems, "_id", listItem._id);
        if ( !cart.listitems || existingItemIdx === -1){
            cart.listitems.push({
                item : listItem,
                quantity : parseInt(quantity)
            });
        }
        else {
            cart.listitems[existingItemIdx].quantity += parseInt(quantity);
        }
        recalcTotalPrice();
    }

    function updateQuant (id, newQuant) {
        console.log("updating quantity");

        var existingItemIdx = cartListIndexOf(cart.listitems, "_id", id);

        if ( !cart.listitems || existingItemIdx === -1){
            return; //short circuit, should prob throw error;
        }
        else {
            cart.listitems[existingItemIdx].quantity = parseInt(newQuant);
            recalcTotalPrice();
        }
    }

    function removeItem(id) {
        cart.listitems = cart.listitems.filter(function(cartItem) {
            if (cartItem.item._id === id) {
                cart.totalPrice -= cartItem.item.price * cartItem.quantity;
                return false;
            }
            return true;
        });
    }

    function clearCart() {
        cart.$reset({
            listitems : [],
            totalPrice  : 0
        });
    }

    function getCart() {
        return cart;
    }

    function createNewOrder(newCart) {
        console.log('CREATE NEW ORDER WITH:', newCart);
        return $http.post("/api/order", newCart)
            .then(returnResponse);
    }

    function updateOrder(order) {
        return $http.put("/api/order/" + order._id, order)
            .then(returnResponse);
    }

    function getUserOrders(user_id) {
        var api_url = user_id ? '/api/order/user/' + user_id : '/api/order';
        return $http
            .get(api_url)
            .then(returnResponse);
    }

    return {
        pushCartItem   : pushCartItem,
        removeItem     : removeItem,
        clearCart      : clearCart,
        getCart        : getCart,
        createNewOrder : createNewOrder,
        updateOrder    : updateOrder,
        getUserOrders  : getUserOrders,
        updateQuant    : updateQuant
    };
});