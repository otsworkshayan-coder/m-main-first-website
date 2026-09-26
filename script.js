(function () {
    'use strict';

    /* Mobile menu toggle */
    var menuToggle = document.getElementById('menu-toggle');
    var nav = document.getElementById('primary-nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        });

        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Open menu');
            });
        });
    }

    /* Header scroll state + back-to-top visibility */
    var header = document.querySelector('header');
    var backToTop = document.getElementById('back-to-top');

    function onScroll() {
        var scrolled = window.scrollY > 30;

        if (header) {
            header.classList.toggle('scrolled', scrolled);
        }

        if (backToTop) {
            backToTop.classList.toggle('visible', window.scrollY > 500);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* Active nav link on scroll */
    var sections = Array.prototype.slice.call(document.querySelectorAll('main > section[id]'));
    var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a')) : [];

    if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.getAttribute('id');
                    navLinks.forEach(function (link) {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    /* Search products */
    var searchToggle = document.getElementById('search-toggle');
    var searchPanel = document.getElementById('search-panel');
    var productSearch = document.getElementById('product-search');
    var searchStatus = document.getElementById('search-status');
    var productCards = Array.prototype.slice.call(document.querySelectorAll('#shop article'));

    function setPanelState(panel, toggle, isOpen) {
        if (!panel || !toggle) {
            return;
        }

        panel.classList.toggle('open', isOpen);
        panel.setAttribute('aria-hidden', String(!isOpen));
        toggle.setAttribute('aria-expanded', String(isOpen));
    }

    if (searchToggle && searchPanel && productSearch) {
        searchToggle.addEventListener('click', function (event) {
            event.preventDefault();
            var isOpen = !searchPanel.classList.contains('open');
            setPanelState(searchPanel, searchToggle, isOpen);

            if (isOpen) {
                productSearch.focus();
            }
        });

        productSearch.addEventListener('input', function () {
            var query = productSearch.value.trim().toLowerCase();
            var matches = 0;

            productCards.forEach(function (card) {
                var matchesQuery = !query || card.textContent.toLowerCase().indexOf(query) !== -1;
                card.hidden = !matchesQuery;
                matches += matchesQuery ? 1 : 0;
            });

            if (searchStatus) {
                searchStatus.textContent = query ? matches + ' product' + (matches === 1 ? '' : 's') + ' found.' : '';
            }
        });
    }

    /* Cart counter and cart panel */
    var cartCount = document.getElementById('cart-count');
    var cartToggle = document.getElementById('cart-toggle');
    var cartPanel = document.getElementById('cart-panel');
    var closeCart = document.getElementById('close-cart');
    var cartItemsContainer = document.getElementById('cart-items');
    var cartTotalValue = document.getElementById('cart-total-value');
    var confirmOrder = document.getElementById('confirm-order');
    var cartNote = document.getElementById('cart-note');
    var checkoutSection = document.getElementById('checkout');
    var checkoutItems = document.getElementById('checkout-items');
    var checkoutTotal = document.getElementById('checkout-total');
    var checkoutForm = document.getElementById('checkout-form');
    var checkoutNote = document.getElementById('checkout-note');
    var cartItems = [];

    try {
        cartItems = JSON.parse(localStorage.getItem('athletix-cart') || '[]');
        cartItems.forEach(function (item) {
            item.quantity = Number(item.quantity) || 1;
        });
    } catch (error) {
        cartItems = [];
    }

    function getCartCount() {
        return cartItems.reduce(function (count, item) {
            return count + (Number(item.quantity) || 1);
        }, 0);
    }

    function saveCart() {
        localStorage.setItem('athletix-cart', JSON.stringify(cartItems));
    }

    function renderCart() {
        var total = 0;

        if (!cartItemsContainer || !cartTotalValue) {
            return;
        }

        if (!cartItems.length) {
            cartItemsContainer.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
        } else {
            cartItemsContainer.innerHTML = cartItems.map(function (item) {
                var quantity = Number(item.quantity) || 1;
                total += item.price * quantity;
                return '<div class="cart-item"><div><strong>' + item.name + '</strong><span>' + item.category + '</span><small>$' + item.price.toFixed(2) + ' each</small></div><div class="cart-item-actions"><strong>$' + (item.price * quantity).toFixed(2) + '</strong><div class="quantity-controls"><button type="button" class="quantity-button" data-action="decrease" data-index="' + item.index + '" aria-label="Remove one ' + item.name + '">-</button><span>' + quantity + '</span><button type="button" class="quantity-button" data-action="increase" data-index="' + item.index + '" aria-label="Add one more ' + item.name + '">+</button></div></div></div>';
            }).join('');
        }

        cartTotalValue.textContent = '$' + total.toFixed(2);

        if (cartCount) {
            cartCount.textContent = String(getCartCount());
        }

        if (checkoutItems && checkoutTotal) {
            checkoutItems.innerHTML = cartItems.length ? cartItems.map(function (item) {
                var quantity = Number(item.quantity) || 1;
                return '<p>' + item.name + ' x' + quantity + ' - $' + (item.price * quantity).toFixed(2) + '</p>';
            }).join('') : '<p class="cart-empty">No products selected.</p>';
            checkoutTotal.textContent = 'Total: $' + total.toFixed(2);
        }
    }

    document.querySelectorAll('.add-to-cart').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();

            var card = button.closest('article');
            var nameElement = card ? card.querySelector('h3') : null;
            var categoryElement = card ? card.querySelector('p') : null;
            var priceElement = card ? card.querySelector('.price strong') : null;
            var price = priceElement ? parseFloat(priceElement.textContent.replace('$', '')) : 0;

            var productName = nameElement ? nameElement.textContent.trim() : 'Product';
            var existingItem = cartItems.find(function (item) {
                return item.name === productName;
            });

            if (existingItem) {
                existingItem.quantity = (Number(existingItem.quantity) || 1) + 1;
            } else {
                cartItems.push({
                    name: productName,
                    category: categoryElement ? categoryElement.textContent.trim() : 'ATHLETIX',
                    price: price,
                    quantity: 1,
                    index: cartItems.length
                });
            }
            saveCart();

            var count = getCartCount();

            if (cartCount) {
                cartCount.textContent = String(count);
                cartCount.classList.remove('bump');
                void cartCount.offsetWidth;
                cartCount.classList.add('bump');
            }

            var originalText = button.textContent;
            button.textContent = 'Added ✓';
            button.classList.add('added');

            setTimeout(function () {
                button.textContent = originalText;
                button.classList.remove('added');
            }, 1200);

            renderCart();
        });
    });

    if (cartToggle && cartPanel) {
        cartToggle.addEventListener('click', function (event) {
            event.preventDefault();
            setPanelState(cartPanel, cartToggle, !cartPanel.classList.contains('open'));
        });

        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', function (event) {
                var quantityButton = event.target.closest('.quantity-button');

                if (!quantityButton) {
                    return;
                }

                var itemIndex = Number(quantityButton.getAttribute('data-index'));
                var item = cartItems[itemIndex];
                var change = quantityButton.getAttribute('data-action') === 'increase' ? 1 : -1;

                if (item) {
                    item.quantity = (Number(item.quantity) || 1) + change;
                }

                if (item && item.quantity <= 0) {
                    cartItems.splice(itemIndex, 1);
                }

                cartItems.forEach(function (item, index) {
                    item.index = index;
                });

                if (cartCount) {
                    cartCount.textContent = String(getCartCount());
                }

                saveCart();
                renderCart();
            });
        }

        if (confirmOrder && checkoutSection && cartPanel && cartToggle) {
            confirmOrder.addEventListener('click', function () {
                if (!cartItems.length) {
                    if (cartNote) {
                        cartNote.textContent = 'Add a product before confirming your order.';
                    }
                    return;
                }

                if (cartNote) {
                    cartNote.textContent = '';
                }

                saveCart();
                setPanelState(cartPanel, cartToggle, false);
                window.location.href = 'checkout/index.html';
            });
        }

        if (checkoutForm && checkoutNote) {
            checkoutForm.addEventListener('submit', function (event) {
                event.preventDefault();
                checkoutNote.textContent = 'Order received. Thank you for shopping with ATHLETIX.';
                checkoutForm.reset();
            });
        }
    }

    if (closeCart && cartPanel && cartToggle) {
        closeCart.addEventListener('click', function () {
            setPanelState(cartPanel, cartToggle, false);
        });
    }

    renderCart();

    /* Newsletter form */
    var form = document.getElementById('newsletter-form');
    var note = document.getElementById('newsletter-note');

    if (form && note) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            var input = form.querySelector('#email');
            var value = input ? input.value.trim() : '';
            var isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

            if (!isValid) {
                note.textContent = 'Please enter a valid email address.';
                note.classList.add('error');
                return;
            }

            note.classList.remove('error');
            note.textContent = 'Thanks for subscribing — check your inbox for your 10% code.';
            form.reset();
        });
    }
})();
