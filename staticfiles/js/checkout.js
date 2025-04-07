
$(document).ready(function() {
    loadCartItems();
    calculateOrderSummary();

    // Handle shipping form submission
    $('#shipping-form').submit(function(e) {
        e.preventDefault();
        
        // Save shipping information to local storage
        const shippingInfo = {
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            email: $('#email').val(),
            phone: $('#phoneNumber').val(),
            address: $('#address').val(),
            city: $('#city').val(),
            state: $('#state').val(),
            pincode: $('#pincode').val()
        };
        
        localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
        
        // Move to payment step
        $('#shipping-step').addClass('d-none');
        $('#payment-step').removeClass('d-none');
        updateCheckoutSteps(2);
    });

    // Handle payment method selection
    $('input[name="paymentMethod"]').change(function() {
        // Hide all payment forms
        $('.payment-form').addClass('d-none');
        
        // Show the appropriate payment form
        const selectedMethod = $(this).val();
        if (selectedMethod === 'upi') {
            $('#upi-form').removeClass('d-none');
        } else if (selectedMethod === 'netBanking') {
            $('#netbanking-form').removeClass('d-none');
        }
    });

    // Back to shipping button
    $('.back-to-shipping').click(function() {
        $('#payment-step').addClass('d-none');
        $('#shipping-step').removeClass('d-none');
        updateCheckoutSteps(1);
    });

    // Handle payment button click
    $('#make-payment').click(function() {
        const paymentMethod = $('input[name="paymentMethod"]:checked').val();
        
        if (paymentMethod === 'razorpay') {
            processRazorpayPayment();
        } else if (paymentMethod === 'upi') {
            processUpiPayment();
        } else if (paymentMethod === 'netBanking') {
            processNetbankingPayment();
        } else if (paymentMethod === 'cod') {
            processCashOnDelivery();
        }
    });

    // Function to process Razorpay payment
    function processRazorpayPayment() {
        const totalAmount = parseFloat($('.total-amount').text().replace('₹', '')) * 100; // Convert to paisa
        
        // Create order on the server
        $.ajax({
            url: '/create-order',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                amount: totalAmount,
            }),
            success: function(response) {
                // Initialize Razorpay checkout
                const options = {
                    key: response.key,
                    amount: response.amount,
                    currency: response.currency,
                    name: 'Bhavi India Fashion',
                    description: 'Purchase of Traditional Indian Wear',
                    order_id: response.id,
                    handler: function(response) {
                        // Payment success
                        verifyPayment(response);
                    },
                    prefill: {
                        name: $('#firstName').val() + ' ' + $('#lastName').val(),
                        email: $('#email').val(),
                        contact: $('#phoneNumber').val()
                    },
                    theme: {
                        color: '#3399cc'
                    }
                };
                
                const rzp = new Razorpay(options);
                rzp.open();
            },
            error: function(error) {
                showNotification('Failed to create payment order. Please try again.', 'danger');
                console.error(error);
            }
        });
    }

    // Function to verify payment with server
    function verifyPayment(response) {
        $.ajax({
            url: '/payment-success',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: localStorage.getItem('orderId')
            }),
            success: function() {
                // Show confirmation
                displayOrderConfirmation();
                // Clear cart
                localStorage.setItem('cart', JSON.stringify([]));
            },
            error: function() {
                showNotification('Payment verification failed. Please contact support.', 'danger');
            }
        });
    }

    // Function to process UPI payment
    function processUpiPayment() {
        const upiId = $('#upiId').val();
        
        if (!upiId) {
            showNotification('Please enter your UPI ID', 'warning');
            return;
        }
        
        // In a real implementation, this would integrate with a UPI payment provider
        // For this demo, we'll simulate a payment success
        
        // Show processing notification
        showNotification('Processing UPI payment...', 'info');
        
        // Simulate processing delay
        setTimeout(function() {
            displayOrderConfirmation();
            localStorage.setItem('cart', JSON.stringify([]));
        }, 2000);
    }

    // Function to process Net Banking payment
    function processNetbankingPayment() {
        const selectedBank = $('#bankSelect').val();
        
        if (!selectedBank) {
            showNotification('Please select your bank', 'warning');
            return;
        }
        
        // In a real implementation, this would redirect to the bank's payment page
        // For this demo, we'll simulate a payment success
        
        // Show processing notification
        showNotification('Redirecting to bank payment gateway...', 'info');
        
        // Simulate processing delay
        setTimeout(function() {
            displayOrderConfirmation();
            localStorage.setItem('cart', JSON.stringify([]));
        }, 2000);
    }

    // Function to process Cash on Delivery
    function processCashOnDelivery() {
        const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo'));
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalAmount = parseFloat($('.total-amount').text().replace('₹', ''));
        
        // Create COD order on the server
        $.ajax({
            url: '/cod-checkout',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                shipping_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} - ${shippingInfo.pincode}`,
                total_amount: totalAmount,
                cart_items: cart
            }),
            success: function(response) {
                localStorage.setItem('orderId', response.order_id);
                displayOrderConfirmation();
                localStorage.setItem('cart', JSON.stringify([]));
            },
            error: function() {
                showNotification('Failed to place order. Please try again.', 'danger');
            }
        });
    }

    // Function to display order confirmation
    function displayOrderConfirmation() {
        $('#payment-step').addClass('d-none');
        $('#confirmation-step').removeClass('d-none');
        updateCheckoutSteps(3);
        
        // Set order details
        const orderId = localStorage.getItem('orderId') || generateRandomOrderId();
        $('.order-id').text(orderId);
        
        const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo'));
        $('.confirmation-email').text(shippingInfo.email);
    }

    // Helper function to update checkout steps UI
    function updateCheckoutSteps(currentStep) {
        $('.checkout-steps .step').removeClass('active');
        $('.checkout-steps .step').each(function(index) {
            if (index < currentStep) {
                $(this).addClass('active');
            }
        });
    }

    // Function to load cart items
    function loadCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const orderItemsContainer = $('.order-items');
        orderItemsContainer.empty();
        
        if (cart.length === 0) {
            orderItemsContainer.html('<p class="text-center">Your cart is empty</p>');
            return;
        }
        
        // In a real app, we would fetch product details from the server
        // For this demo, we'll use sample data from local storage
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        cart.forEach(function(productId) {
            const product = products.find(p => p.id == productId) || 
                { id: productId, name: "Product " + productId, price: 1299, img: "https://via.placeholder.com/50x50" };
            
            const itemHtml = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="d-flex align-items-center">
                        <img src="${product.img}" width="50" height="50" class="me-2" alt="${product.name}">
                        <div>
                            <h6 class="mb-0">${product.name}</h6>
                            <small class="text-muted">Qty: 1</small>
                        </div>
                    </div>
                    <span>₹${product.price}</span>
                </div>
            `;
            
            orderItemsContainer.append(itemHtml);
        });
    }

    // Function to calculate order summary
    function calculateOrderSummary() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        let subtotal = 0;
        
        cart.forEach(function(productId) {
            const product = products.find(p => p.id == productId) || { price: 1299 };
            subtotal += parseFloat(product.price);
        });
        
        const shippingCost = subtotal > 0 ? 50 : 0;
        const taxAmount = (subtotal * 0.18).toFixed(2);
        const totalAmount = (subtotal + shippingCost + parseFloat(taxAmount)).toFixed(2);
        
        $('.subtotal').text('₹' + subtotal.toFixed(2));
        $('.shipping-cost').text('₹' + shippingCost.toFixed(2));
        $('.tax-amount').text('₹' + taxAmount);
        $('.total-amount').text('₹' + totalAmount);
    }

    // Helper function to generate a random order ID
    function generateRandomOrderId() {
        return 'ORD' + Math.floor(100000 + Math.random() * 900000);
    }

    // Helper function to show notifications
    function showNotification(message, type) {
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'danger' ? 'alert-danger' :
                          type === 'warning' ? 'alert-warning' : 'alert-info';

        const notification = $(`
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `);

        $('#notification-area').append(notification);
        
        setTimeout(function() {
            notification.alert('close');
        }, 5000);
    }
});
