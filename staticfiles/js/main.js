$(document).ready(function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Check if user is logged in
    function isLoggedIn() {
        return localStorage.getItem('user') !== null;
    }

// main.js
$('#loginForm').on('submit', function(e) {
    e.preventDefault();
    var formData = {
        email: $('#loginEmail').val(),
        password: $('#loginPassword').val()
    };
    $.ajax({
        url: '/login/',
        method: 'POST',
        data: JSON.stringify(formData),
        contentType: 'application/json',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('input[name=csrfmiddlewaretoken]').val());
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        },
        success: function(response) {
            if (response.success) {
                console.log(response.message);
                showNotification(response.message, 'success');
                localStorage.setItem('user', JSON.stringify(response.user));
                $('#loginModal').modal('hide');
                updateUIForAuth();
                window.location.href = response.redirect;
            } else {
                showNotification(response.message, 'danger');
            }
        },
        error: function(xhr) {
            var errorMessage = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Login failed';
            showNotification(errorMessage, 'danger');
        }
    });
});

function updateUIForAuth() {
    $.ajax({
        url: "/auth-status/",
        method: "GET",
        xhrFields: {
            withCredentials: true  // Ensures cookies (session ID) are sent
        },
        success: function(response) {
            console.log("Auth status response:", response);
            if (response.is_authenticated) {
                if (response.is_superuser) {
                    // Admin: Keep UI minimal or admin-specific
                    console.log("Admin logged in, setting UI with logout");
                    $('#userDropdown').html('Profile');
                    $('.dropdown-menu').html(
                        '<li class="nav-item">' +
                        '<a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Login</a>' +
                        '</li>'
                    );
                } else {
                    console.log("Updating UI for regular user");
                    $('#userDropdown').html('<i class="fas fa-user"></i> ' + response.username);
                    $('.dropdown-menu').html(`
                        <li><a class="dropdown-item" href="/profile/">My Profile</a></li>
                        <li><a class="dropdown-item" href="/profile/#v-pills-orders">My Orders</a></li>
                        <li><a class="dropdown-item" href="/wishlist/#v-pills-wishlist">My Wishlist</a></li>
                        <li><hr class="dropdown-divider" /></li>
                        <li>
                            <form id="logout-form" action="/logout/" method="post">
                                <input type="hidden" name="csrfmiddlewaretoken" value="${$('input[name=csrfmiddlewaretoken]').val()}">
                                <button type="submit" class="dropdown-item logout-btn">Logout</button>
                            </form>
                        </li>
                    `);
                }
            } else {
                // Not authenticated
                console.log("Not authenticated, showing logged-out state");
                $('#userDropdown').html('Profile');
                $('.dropdown-menu').html(
                    '<li class="nav-item">' +
                    '<a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Login</a>' +
                    '</li>'
                );
            }
        },
        error: function(xhr, status, error) {
            console.error("Error checking auth status:", status, error);
        }
    });
}
// Call this on page load
$(document).ready(function() {
    updateUIForAuth();
});

$(document).on('click', '.logout-btn', function(e) {
    e.preventDefault();
    $.ajax({
        url: '/logout/',
        method: 'POST',
        data: $('#logout-form').serialize(),  
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('input[name=csrfmiddlewaretoken]').val());
        },
        success: function(response) {
            if (response.status === 'success') {
                localStorage.removeItem('user');
                showNotification("Logged out successfully", "success");
                updateUIForAuth(); 
                window.location.href = '/';  
            }else{
                showNotification("Unexpected response from server", "warning");
            }
        },
        error: function(xhr, status, error) {
            console.error("Logout error:", xhr.status, error);  
            if (xhr.status === 0 || xhr.status === 403 || xhr.status === 302) {
                localStorage.removeItem('user');
                updateUIForAuth();
                window.location.href = '/';
            } else {
                showNotification("Error logging out: " + error, "danger");
            }
        }
    });
});

// Initial check on page load
$(document).ready(function() {
    updateUIForAuth();
});

//profile update
$('#profileForm').on('submit', function(e) {
    e.preventDefault();
    $.ajax({
        url: '/update-profile/',
        method: 'POST',
        data: $(this).serialize(),
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('input[name=csrfmiddlewaretoken]').val());
        },
        success: function(response) {
            if (response.status === 'success') {
                showNotification('Profile updated successfully', 'success');
                $('#infoUsername').text($('#editUsername').val());
                $('#infoAddress').text($('#editAddress').val());
            } else {
                showNotification(response.message, 'danger');
            }
        },
        error: function() {
            showNotification('Error updating profile', 'danger');
        }
    });
});

    // Cart functionality
    $(document).ready(function() {
        // Add to Cart
        $('.add-to-cart-form').on('submit', function(e) {
            e.preventDefault();
            var $form = $(this);
            var productId = $form.data('product-id');
            var quantity = $form.find('input[name="quantity"]').val();
    
            $.ajax({
                url: '/add-to-cart/',
                method: 'POST',
                data: {
                    'product_id': productId,
                    'quantity': quantity,
                    'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
                },
                success: function(response) {
                    if (response.status === 'success') {
                        showNotification(response.message, 'success');
                        // Optionally update cart item count in UI
                        $('#cartItemCount').text(response.cart_item_count);  // Add this element to navbar if needed
                    } else {
                        showNotification(response.message, 'warning');
                    }
                },
                error: function(xhr, status, error) {
                    showNotification('Error adding to cart', 'danger');
                }
            });
        });
    });

    // Go to cart when clicked
    $(document).on('click', '.go-to-cart', function(e) {
        e.preventDefault();
        window.location.href = 'cart.html';
    });

    // Wishlist functionality
    $(document).on('click', '.add-to-wishlist', function(e) {
        e.preventDefault();

        // Check if user is logged in
        if (!isLoggedIn()) {
            showNotification('Please login to add items to wishlist', 'warning');
            $('#loginModal').modal('show');
            return;
        }

        const button = $(this);
        const productId = button.data('product-id');
        let icon = button.find('i');

        // Toggle wishlist in local storage
        let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

        if (icon.hasClass('fas')) {
            // Remove from wishlist
            wishlist = wishlist.filter(id => id !== productId);
            icon.removeClass('fas').addClass('far');
            showNotification('Product removed from wishlist', 'info');
        } else {
            // Add to wishlist
            if (!wishlist.includes(productId)) {
                wishlist.push(productId);
                showNotification('Product added to wishlist!', 'success');
            } else {
                showNotification('Product already in wishlist', 'info');
            }
            icon.removeClass('far').addClass('fas');
        }

        localStorage.setItem('wishlist', JSON.stringify(wishlist));

        // Update wishlist count
        $('.wishlist-count').text(wishlist.length);
    });

    // Update counts based on local storage
    function updateCounts() {
        let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');

        $('.wishlist-count').text(wishlist.length);
        $('.cart-count').text(cart.length);
    }

    // Notification helper
    function showNotification(message, type) {
        const alertClass = type === 'success' ? 'alert-success' :
                          type === 'danger' ? 'alert-danger' :
                          type === 'warning' ? 'alert-warning' : 'alert-info';

        const notification = $(`
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);

        $('#notification-area').append(notification);
        setTimeout(() => {
            notification.alert('close');
        }, 3000);
    }

    // Initialize the page
    updateUIForAuth();
    updateCounts();
    if($('#productsGrid').length) {
        filterProducts();
    }

    // Load featured products on homepage
    if($('#featuredProducts').length) {
        const featuredProducts = products.slice(0, 4); // Show first 4 products
        featuredProducts.forEach(product => {
            // Get wishlist and cart from local storage
            let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');

            // Check if this product is in the wishlist
            const isInWishlist = wishlist.includes(product.id);
            const heartIcon = isInWishlist ? 'fas fa-heart' : 'far fa-heart';

            // Check if this product is in the cart
            const isInCart = cart.includes(product.id);
            const cartButtonText = isInCart ? 'Go to Cart' : 'Add to Cart';
            const cartButtonClass = isInCart ? 'btn-success' : 'btn-primary';
            const cartButtonAction = isInCart ? 'go-to-cart' : 'add-to-cart-btn';

            const productHtml = `
                <div class="col-6 col-md-3">
                    <div class="product-card card h-100">
                        <div class="product-image-wrapper">
                            <img src="${product.img}" class="card-img-top" alt="Product">
                            <div class="product-actions">
                                <button class="btn btn-sm add-to-wishlist" data-product-id="${product.id}">
                                    <i class="${heartIcon}"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="text-muted small mb-2">${product.category}</p>
                            <p class="text-primary fw-bold mb-3">₹${product.price}</p>
                            <div class="d-grid">
                                <button class="btn ${cartButtonClass} ${cartButtonAction}" data-product-id="${product.id}">${cartButtonText}</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            $('#featuredProducts').append(productHtml);
        });
    }

    // Load user data when page loads
    loadUserData();

    // Bulk Order functionality
    function initBulkOrder() {
        $('#bulkOrderForm').submit(function(e) {
            e.preventDefault();

            // Get selected product categories
            let selectedCategories = [];
            $('input[type=checkbox]:checked').each(function() {
                selectedCategories.push($(this).val());
            });

            if (selectedCategories.length === 0) {
                showNotification('Please select at least one product category', 'danger');
                return;
            }

            // Sample data to be sent to server
            const bulkOrderData = {
                businessName: $('#businessName').val(),
                contactName: $('#contactName').val(),
                contactPhone: $('#contactPhone').val(),
                contactEmail: $('#contactEmail').val(),
                businessAddress: $('#businessAddress').val(),
                gstNumber: $('#gstNumber').val(),
                categories: selectedCategories,
                estimatedQuantity: $('#estimatedQuantity').val(),
                orderFrequency: $('#orderFrequency').val(),
                additionalInfo: $('#additionalInfo').val()
            };

            // In a real application, you would send this data to the server
            console.log('Bulk Order Data:', bulkOrderData);

            // Show success notification
            showNotification('Bulk order inquiry submitted successfully! Our team will contact you within 24 hours.', 'success');

            // Reset form
            this.reset();
        });
    }

    // Tailor Application functionality
    function initTailorApplication() {
        // Toggle "Other Skills" field visibility
        $('#skillOther').change(function() {
            if ($(this).is(':checked')) {
                $('#otherSkillsDiv').show();
            } else {
                $('#otherSkillsDiv').hide();
            }
        });

        // Initialize speech synthesis
        const voiceHelpers = () => {
            // Check if browser supports speech synthesis
            if ('speechSynthesis' in window) {
                // Voice helper buttons functionality
                $('.voice-helper').click(function() {
                    const hindiText = $(this).data('voice-hindi');
                    const gujaratiText = $(this).data('voice-gujarati');

                    // Get current language preference (default to Hindi)
                    const currentLang = localStorage.getItem('voiceLanguage') || 'hindi';

                    // Select text based on language
                    const textToSpeak = currentLang === 'hindi' ? hindiText : gujaratiText;

                    // Create utterance
                    const utterance = new SpeechSynthesisUtterance(textToSpeak);
                    utterance.lang = currentLang === 'hindi' ? 'hi-IN' : 'gu-IN';
                    utterance.rate = 0.9; // Slightly slower

                    // Stop any ongoing speech
                    window.speechSynthesis.cancel();

                    // Speak
                    window.speechSynthesis.speak(utterance);
                });

                // Language selection buttons
                $('#hindiHelp').click(function() {
                    localStorage.setItem('voiceLanguage', 'hindi');
                    showNotification('हिंदी भाषा चुनी गई (Hindi language selected)', 'success');

                    // Speak a welcome message
                    const utterance = new SpeechSynthesisUtterance('अब आपको हिंदी में निर्देश मिलेंगे। फॉर्म भरने के लिए स्पीकर आइकन पर क्लिक करें।');
                    utterance.lang = 'hi-IN';
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(utterance);
                });

                $('#gujaratiHelp').click(function() {
                    localStorage.setItem('voiceLanguage', 'gujarati');
                    showNotification('ગુજરાતી ભાષા પસંદ કરવામાં આવી (Gujarati language selected)', 'success');

                    // Speak a welcome message
                    const utterance = new SpeechSynthesisUtterance('હવે તમને ગુજરાતીમાં સૂચનાઓ મળશે. ફોર્મ ભરવા માટે સ્પીકર આઇકન પર ક્લિક કરો.');
                    utterance.lang = 'gu-IN';
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(utterance);
                });

                // Provide initial guidance when modal opens
                $('#applicationModal').on('shown.bs.modal', function() {
                    setTimeout(() => {
                        const lang = localStorage.getItem('voiceLanguage') || 'hindi';
                        let welcomeText, langCode;

                        if (lang === 'hindi') {
                            welcomeText = 'फॉर्म भरने के लिए हर फील्ड के पास स्पीकर बटन पर क्लिक करें';
                            langCode = 'hi-IN';
                        } else {
                            welcomeText = 'ફોર્મ ભરવા માટે દરેક ફીલ્ડની બાજુમાં સ્પીકર બટન પર ક્લિક કરો';
                            langCode = 'gu-IN';
                        }

                        const utterance = new SpeechSynthesisUtterance(welcomeText);
                        utterance.lang = langCode;
                        window.speechSynthesis.cancel();
                        window.speechSynthesis.speak(utterance);
                    }, 1000);
                });

                // Cancel speech when modal closes
                $('#applicationModal').on('hidden.bs.modal', function() {
                    window.speechSynthesis.cancel();
                });
            }
        };

        // Initialize voice helpers once the document is ready
        voiceHelpers();

        // Job Application Form Submission
        $('#jobApplicationForm').submit(function(e) {
            e.preventDefault();

            // Get selected skills
            let selectedSkills = [];
            $('input[type=checkbox]:checked').each(function() {
                selectedSkills.push($(this).val());
            });

            if (selectedSkills.length === 0) {
                showNotification('कृपया कम से कम एक कौशल चुनें (Please select at least one skill)', 'danger');
                return;
            }

            // Sample data to be sent to server
            const applicationData = {
                jobTitle: $('#jobTitle').val(),
                applicantName: $('#applicantName').val(),
                applicantPhone: $('#applicantPhone').val(),
                applicantAddress: $('#applicantAddress').val(),
                experienceYears: $('#experienceYears').val(),
                skills: selectedSkills,
                otherSkills: $('#otherSkills').val(),
                workLocation: $('#workLocation').val(),
                communicationMethod: $('input[name="communicationMethod"]:checked').val()
            };

            // In a real application, you would send this data to the server
            console.log('Application Data:', applicationData);

            // Stop any ongoing speech
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }

            // Speak success message in selected language
            const lang = localStorage.getItem('voiceLanguage') || 'hindi';
            let successText, langCode;

            if (lang === 'hindi') {
                successText = 'आपका फॉर्म सफलतापूर्वक जमा किया गया है। हम जल्द ही आपसे संपर्क करेंगे।';
                langCode = 'hi-IN';
            } else {
                successText = 'તમારું ફોર્મ સફળતાપૂર્વક સબમિટ થયું છે. અમે ટૂંક સમયમાં તમારો સંપર્ક કરીશું.';
                langCode = 'gu-IN';
            }

            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(successText);
                utterance.lang = langCode;
                window.speechSynthesis.speak(utterance);
            }

            // Show success notification
            showNotification('आपका फॉर्म सफलतापूर्वक जमा किया गया है! (Your application has been submitted successfully!)', 'success');

            // Close modal and reset form after a delay to allow speech to complete
            setTimeout(() => {
                $('#applicationModal').modal('hide');
                this.reset();
                $('#otherSkillsDiv').hide();
            }, 3000);
        });
    }

    initBulkOrder();
    initTailorApplication();
});