(function () {
    'use strict';

    var checkoutForm = document.getElementById('checkout-form');
    var orderItems = document.getElementById('order-items');
    var orderTotal = document.getElementById('order-total');
    var formMessage = document.getElementById('form-message');
    var cartItems = [];

    try {
        cartItems = JSON.parse(localStorage.getItem('athletix-cart') || '[]');
    } catch (error) {
        cartItems = [];
    }

    function renderOrder() {
        var total = cartItems.reduce(function (sum, item) {
            return sum + Number(item.price || 0) * (Number(item.quantity) || 1);
        }, 0);

        if (!cartItems.length) {
            orderItems.innerHTML = '<p class="empty-order">Your cart is empty. <a href="../index.html">Return to store</a>.</p>';
        } else {
            orderItems.innerHTML = cartItems.map(function (item) {
                var quantity = Number(item.quantity) || 1;
                return '<div class="order-item"><div><strong>' + item.name + ' x' + quantity + '</strong><span>' + item.category + '</span></div><strong>$' + (Number(item.price || 0) * quantity).toFixed(2) + '</strong></div>';
            }).join('');
        }

        orderTotal.textContent = '$' + total.toFixed(2);
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!cartItems.length) {
                formMessage.textContent = 'Your cart is empty. Please add a product first.';
                formMessage.style.color = 'var(--danger)';
                return;
            }

            formMessage.style.color = 'var(--primary)';
            formMessage.textContent = 'Order placed successfully. Thank you for shopping with ATHLETIX.';
            localStorage.removeItem('athletix-cart');
            checkoutForm.reset();
        });
    }

    renderOrder();
})();
