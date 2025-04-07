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

    // Update UI based on login status
    function updateUIForAuth() {
        if (isLoggedIn()) {
            const user = JSON.parse(localStorage.getItem('user'));
            $('.user-auth-section').html(`
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user"></i> ${user.username}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="profile.html">My Profile</a></li>
                        <li><a class="dropdown-item" href="profile.html#v-pills-orders">My Orders</a></li>
                        <li><a class="dropdown-item" href="profile.html#v-pills-wishlist">My Wishlist</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item logout-btn" href="#">Logout</a></li>
                    </ul>
                </li>
            `);
        } else {
            $('.user-auth-section').html(`
                <li class="nav-item">
                    <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Login</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#registerModal">Register</a>
                </li>
            `);
        }
    }

    // Filter products based on selected categories and price range
    function filterProducts() {
        let selectedCategories = [];
        $('.category-filter:checked').each(function() {
            selectedCategories.push($(this).val());
        });

        let minPrice = $('#minPrice').val();
        let maxPrice = $('#maxPrice').val();
        let sortBy = $('#sortBy').val();

        let filteredProducts = products.filter(product => {
            let matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
            let matchesPrice = (!minPrice || product.price >= minPrice) && (!maxPrice || product.price <= maxPrice);
            return matchesCategory && matchesPrice;
        });

        // Sort products
        if(sortBy === 'price_asc') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if(sortBy === 'price_desc') {
            filteredProducts.sort((a, b) => b.price - a.price);
        }

        displayProducts(filteredProducts);
    }

    // Display products in grid
    function displayProducts(products) {
        const productsGrid = $('#productsGrid');
        if (!productsGrid.length) return; // Exit if the element doesn't exist on this page

        productsGrid.empty();

        // Get wishlist and cart from local storage
        let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');

        products.forEach(product => {
            // Check if this product is in the wishlist
            const isInWishlist = wishlist.includes(product.id);
            const heartIcon = isInWishlist ? 'fas fa-heart' : 'far fa-heart';

            // Check if this product is in the cart
            const isInCart = cart.includes(product.id);
            const cartButtonText = isInCart ? 'Go to Cart' : 'Add to Cart';
            const cartButtonClass = isInCart ? 'btn-success' : 'btn-primary';
            const cartButtonAction = isInCart ? 'go-to-cart' : 'add-to-cart';

            const productCard = `
                <div class="col-6 col-md-4 col-lg-3 mb-4">
                    <div class="product-card card h-100">
                        <div class="product-image-wrapper">
                            <img src="${product.img}" class="card-img-top product-image" alt="${product.name}">
                            <div class="product-actions">
                                <button class="btn btn-sm add-to-wishlist" data-product-id="${product.id}">
                                    <i class="${heartIcon}"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <h6 class="card-title product-name">${product.name}</h6>
                            <p class="card-text product-category">${product.category}</p>
                            <p class="card-text product-price">₹${product.price}</p>
                            <button class="btn ${cartButtonClass} w-100 ${cartButtonAction}" data-product-id="${product.id}">
                                ${cartButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            productsGrid.append(productCard);
        });
    }

    // Event listeners
    $('.category-filter').change(filterProducts);
    $('#minPrice, #maxPrice').on('input', filterProducts);
    $('#sortBy').change(filterProducts);

    // // Function to check login status and update UI
    // function checkLoginStatus() {
    //     $.ajax({
    //         url: '/check-auth/',  // Django auth check URL
    //         type: 'GET',
    //         success: function(response) {
    //             if (response.logged_in) {
    //                 const user = JSON.parse(localStorage.getItem('user'));
    //                 $('.user-auth-section').html(`
    //                     <li class="nav-item dropdown">
    //                         <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
    //                             <i class="fas fa-user"></i> ${user.username}
    //                         </a>
    //                         <ul class="dropdown-menu dropdown-menu-end">
    //                             <li><a class="dropdown-item" href="profile.html">My Profile</a></li>
    //                             <li><a class="dropdown-item" href="profile.html#v-pills-orders">My Orders</a></li>
    //                             <li><a class="dropdown-item" href="profile.html#v-pills-wishlist">My Wishlist</a></li>
    //                             <li><hr class="dropdown-divider"></li>
    //                             <li><a class="dropdown-item logout-btn" href="#">Logout</a></li>
    //                         </ul>
    //                     </li>
    //                 `);
    //             } else {
    //                 $('.user-auth-section').html(`
    //                     <li class="nav-item">
    //                         <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Login</a>
    //                     </li>
    //                     <li class="nav-item">
    //                     <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#registerModal">Register</a>
    //                 </li>
    //                 `);
    //     }
    //         }
    //     });
    // }

    // Run the function on page load
    // checkLoginStatus();

    // User Registration 
    $(document).on('submit', '#registerForm', function(e) {
        e.preventDefault();

        const username = $('#registerUsername').val();
        const email = $('#registerEmail').val();
        const password = $('#registerPassword').val();
        const confirmPassword = $('#confirmPassword').val();

        // Simple validation
        if (!username || !email || !password) {
            showNotification('Please fill all fields', 'danger');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'danger');
            return;
        }
 
        // Get CSRF token from the page
        const csrftoken = getCSRFToken();
    
         // Send AJAX request to Django backend
         $.ajax({
            url: '/register/',
            type: 'POST',
            headers: { "X-CSRFToken": csrftoken },  // Include CSRF token
            contentType: 'application/json',
            data: JSON.stringify({
                username: username,
                email: email,
                password: password,
                confirm_password: confirmPassword
            }),
            success: function(response) {
                showNotification(response.message, 'success');
    
                // Automatically open login modal after 1 second
                setTimeout(() => {
                    $('#registerModal').modal('hide');
                    $('#registerForm')[0].reset();
                    $('#loginModal').modal('show');
                }, 3000);
            },
            error: function(xhr) {
                const errorMessage = xhr.responseJSON?.message || 'Registration failed. Try again!';
                showNotification(errorMessage, 'danger');
            }
        });
    });
   // Function to get CSRF token from cookies
   function getCSRFToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        document.cookie.split(';').forEach(cookie => {
            let [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                cookieValue = decodeURIComponent(value);
            }
        });
    }
    return cookieValue;
}
 // User Login (Authenticates with Django)
//  $('#loginForm').on('submit', function(e) {
//     e.preventDefault();

//     const email = $('#loginEmail').val();
//     const password = $('#loginPassword').val();

//     if (!email || !password) {
//         showNotification("Please enter email and password", "danger");
//         return;
//     }

//     $.ajax({
//         url: "/login/", // Django API URL for login
//         method: "POST",
//         contentType: "application/json",
//         data: JSON.stringify({ email, password }),
//         headers: { "X-CSRFToken": getCSRFToken() },
//         success: function(response) {
//             console.log("Server Response:", response);
//             if (response.success) {
//                 setTimeout(() => {
//                     localStorage.setItem('user', JSON.stringify(response.user)); // Store user data
//                     showNotification("Login successful!", "success");
//                     $('#loginModal').modal('hide');  
//                     updateUIForAuth();  // Update UI after login
//                 }, 500);
                                
//             } else {
//                 showNotification(response.message, "danger");
//             }
            
//         },
//         error: function(xhr) {
//             const errorMessage = xhr.responseJSON?.message || 'Login failed. Try again!';
//             showNotification(errorMessage, 'danger');        }        
//     });
// });

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
            showNotification('Login error: ' + xhr.statusText, 'danger');
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
            if (response.is_authenticated) {
                if (response.is_superuser) {
                    // Admin: Keep UI minimal or admin-specific
                    console.log("Admin logged in, not updating UI with profile options");
                    $('#userDropdown').html('<i class="fas fa-user"></i> Admin');  // Or keep as 'Profile'
                    $('.dropdown-menu').html('');  // Clear dropdown or add admin-specific options
                } else {
                    // Regular user: Update UI with profile options
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
                                <a class="dropdown-item logout-btn" href="#">Logout</a>
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


//VIEW.PY
// from django.shortcuts import render,redirect, get_object_or_404
// from django.contrib.auth.models import User
// from django.contrib.auth import authenticate, login,logout,get_user,update_session_auth_hash
// from django.http import JsonResponse,HttpResponse
// from django.contrib.auth.forms import AuthenticationForm
// from django.views.decorators.csrf import csrf_exempt,csrf_protect
// from django.contrib.auth.decorators import login_required
// from django.contrib.admin.views.decorators import staff_member_required
// import json
// from django.views import View
// from django.utils.decorators import method_decorator
// from django.db import IntegrityError
// from django.db.models.signals import post_save
// from django.dispatch import receiver
// from django.contrib import messages
// from .models import Customer,Product, Wishlist,Tailor,Order,Payment,Cart,CartItem,DesignRequest
// from .forms import TailorForm  # ✅ Add this line

// # ==========================
// #       ADMIN VIEWS
// # ==========================
// def user_required(view_func):
//     """Decorator to ensure only non-superusers (regular users) can access the view."""
//     @login_required
//     def wrapper(request, *args, **kwargs):
//         if request.user.is_superuser:
//             return redirect('/admin/')  # Redirect admins to admin panel
//         return view_func(request, *args, **kwargs)
//     return wrapper

// # def get_customer_data(request):
// #     customers = Customer.objects.all()
    
// #     # Prepare data in the format DataTables expects
// #     data = [
// #         {
// #             'id': customer.Customerid,
// #             'name': customer.name,
// #             'email': customer.email,
// #             'phone': customer.phone,
// #             'joinedDate': customer.joined_date.strftime('%Y-%m-%d')  # Format the date as needed
// #         }
// #         for customer in customers
// #     ]
    
// #     # Return data as JSON
// #     return JsonResponse({'data': data})

// # ==========================
// #       USER MANAGEMENT
// # ==========================
// @receiver(post_save, sender=User)
// def create_customer_for_user(sender, instance, created, **kwargs):
//     if created:
//         name = instance.username if instance.username else instance.email
//         Customer.objects.create(user=instance, email=instance.email, name=name)

// @receiver(post_save, sender=User)
// def save_customer_for_user(sender, instance, **kwargs):
//     try:
//         instance.customer.save()
//     except Customer.DoesNotExist:
//         name = instance.username if instance.username else instance.email
//         Customer.objects.create(user=instance, email=instance.email, name=name)


//  # ==========================
// #       ORDER MANAGEMENT
// # ==========================

// #========================
// #       TAILOR MANAGEMENT
// # ==========================


// # ==========================
// #       PRODUCT MANAGEMENT
// # ==========================
// @user_required
// def wishlist(request):
//     customer = request.user.customer
//     wishlist_items = Wishlist.objects.filter(user=customer)
//     return render(request, 'wishlist.html', {'wishlist_items': wishlist_items})

// @login_required
// def add_to_wishlist(request):
//     if request.method == 'POST':
//         product_id = request.POST.get('product_id')
//         product = get_object_or_404(Product, product_id=product_id)
//         customer = request.user.customer

//         # Check if the product is already in the wishlist
//         if not Wishlist.objects.filter(user=customer, product=product).exists():
//             Wishlist.objects.create(user=customer, product=product)
//             return JsonResponse({
//                 'status': 'success',
//                 'message': f'{product.name} added to wishlist',
//                 'wishlist_count': Wishlist.objects.filter(user=customer).count()
//             })
//         return JsonResponse({
//             'status': 'info',
//             'message': f'{product.name} is already in your wishlist'
//         })
//     return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
    
// @user_required
// def wishlist_items(request):
//     customer = request.user.customer
//     wishlist_items = Wishlist.objects.filter(user=customer)
//     items_data = [
//         {
//             'id': item.product.product_id,
//             'name': item.product.name,
//             'category': item.product.category,
//             'price': float(item.product.price),
//             'image': item.product.image.url if item.product.image else 'https://via.placeholder.com/100x100'
//         } for item in wishlist_items
//     ]
//     return JsonResponse({'items': items_data})

// @method_decorator(login_required, name='dispatch')
// class WishlistItemsView(View):
//     def get(self, request):
//         wishlist_items = Wishlist.objects.filter(user=request.user).select_related('product')
//         items = [
//             {
//                 "id": item.product.id,
//                 "name": item.product.name,
//                 "category": item.product.category.name,
//                 "price": item.product.price,
//                 "image": item.product.image.url if item.product.image else ""
//             }
//             for item in wishlist_items
//         ]
//         return JsonResponse({"items": items})

// # @login_required
// # def wishlist_items(request):
// #     try:
// #         customer = Customer.objects.get(user=request.user)  # Get logged-in customer
// #         wishlist = Wishlist.objects.filter(user=customer)  # Fetch wishlist items

// #         items = []
// #         if wishlist.exists():  # Ensure there are items before looping
// #             for item in wishlist:
// #                 try:
// #                     product = item.product  # Get product details
// #                     customer_obj = Customer.objects.get(CustomerId=item.user_id)  # Fetch full customer object

// #                     items.append({
// #                         "id": product.product_id,
// #                         "name": product.name,
// #                         "price": product.price,
// #                         "image": product.image.url if product.image else "/static/images/uv.jpg",
// #                         "category": product.category.name if product.category else "Uncategorized",
// #                     })
// #                 except Customer.DoesNotExist:
// #                     print(f"Error: Customer not found for user_id {item.user_id}")
// #                 except AttributeError as e:
// #                     print(f"Error processing wishlist item: {e}")

// #         return JsonResponse({"items": items})
    
// #     except Customer.DoesNotExist:
// #         return JsonResponse({"error": "Customer not found"}, status=404)
// #     except Exception as e:
// #         return JsonResponse({"error": str(e)}, status=500)

// def get_wishlist(request):
//     # Assuming `Wishlist` is a model for storing the wishlist data
//     user = request.user
//     wishlist_items = Wishlist.objects.filter(user=user)  # Get wishlist items for the current user

//     # Prepare data to send to the front-end
//     data = []
//     for item in wishlist_items:
//         product = item.product
//         data.append({
//             'id': product.id,
//             'name': product.name,
//             'category': product.category,
//             'price': product.price,
//             'img': product.image.url,  # Assuming image field in Product model
//         })

//     return JsonResponse({'wishlist': data})

// @login_required
// def remove_from_wishlist(request):
//     if request.method == 'POST':
//         product_id = request.POST.get('product_id')
//         customer = request.user.customer
//         wishlist_item = Wishlist.objects.filter(user=customer, product__product_id=product_id).first()
//         if wishlist_item:
//             wishlist_item.delete()
//             return JsonResponse({
//                 'status': 'success',
//                 'message': 'Item removed from wishlist',
//                 'wishlist_count': Wishlist.objects.filter(user=customer).count()
//             })
//         return JsonResponse({'status': 'error', 'message': 'Item not found'}, status=404)
//     return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

// def catalog_view(request):
//     products = Product.objects.all()

//     selected_categories = request.GET.getlist("category")
//     if selected_categories:
//         products = products.filter(category__in=selected_categories)
    
//     # Filtering by price range
//     min_price = request.GET.get("minPrice")
//     max_price = request.GET.get("maxPrice")
//     if min_price:
//         products = products.filter(price__gte=min_price)
//     if max_price:
//         products = products.filter(price__lte=max_price)

//     sort_by = request.GET.get("sortBy", "featured")
//     if sort_by == "price_asc":
//         products = products.order_by("price")
//     elif sort_by == "price_desc":
//         products = products.order_by("-price")

//     context = {
//         "products": products,  # QuerySet, not a list
//         "selected_categories": selected_categories,
//         "min_price": min_price,
//         "max_price": max_price,
//         "sort_by": sort_by,
//     }

//     return render(request, "catalog.html", context)

// def index_view(request):
//     featured_products = Product.objects.all()[:4]  # Show only the first 6 products
//     return render(request, 'index.html', {'products': featured_products})


// # =========================
// # 🔐 User Authentication Views
// # =========================
// def check_auth_status(request):
//     if request.user.is_authenticated:
//         return JsonResponse({
//             "is_authenticated": True,
//             "username": request.user.username,
//             "is_superuser": request.user.is_superuser  # Add this
//         })
//     return JsonResponse({"is_authenticated": False})

// @login_required
// def get_user_data(request):
//     user = request.user
//     return JsonResponse({
//         'username': user.username,
//         'email': user.email,
//         'phone': user.profile.phone if hasattr(user, 'profile') else None
//     })
// def get_username(request):
//     if request.user.is_authenticated:
//         return JsonResponse({'username': request.user.username})
//     return JsonResponse({'username': None}, status=401)

// @csrf_exempt
// def user_register(request):
//     if request.method == "POST":
//         try:
//             data = json.loads(request.body.decode("utf-8"))
//             print("Received data:", data)  # ✅ Debugging print
//         except json.JSONDecodeError:
//             return JsonResponse({"success": False, "message": "Invalid JSON format!"}, status=400)

//         username = data.get("username")
//         email = data.get("email")
//         password = data.get("password")
//         confirm_password = data.get("confirm_password")

//         if not (username and email and password and confirm_password):
//             return JsonResponse({"success": False, "message": "All fields are required!"}, status=400)

//         if password != confirm_password:
//             return JsonResponse({"success": False, "message": "Passwords do not match!"}, status=400)

//         if User.objects.filter(username=username).exists():
//             return JsonResponse({"success": False, "message": "Username already taken!"}, status=400)

//         if User.objects.filter(email=email).exists():
//             return JsonResponse({"success": False, "message": "Email is already registered!"}, status=400)

//         # ✅ Create the user and save to database
//         user = User.objects.create_user(username=username, email=email, password=password)
//         user.save()

//         print("User created successfully!")  # ✅ Debugging print

//         return JsonResponse({"success": True, "message": "Registration successful! You can now log in."})

//     return JsonResponse({"success": False, "message": "Invalid request"}, status=400)

// def authenticate_with_email(request, email, password):
//     from django.contrib.auth import get_user_model
//     User = get_user_model()
//     try:
//         user = User.objects.get(email=email)
//         if user.check_password(password):
//             user.backend = 'myecommerce.auth_backends.EmailAuthBackend'
//             return user
//     except User.DoesNotExist:
//         return None

// @csrf_exempt
// def custom_login(request):
//     if request.method == 'POST':
//         username = request.POST.get('username')
//         password = request.POST.get('password')
//         user = authenticate(request, username=username, password=password)
//         if user is not None:
//             login(request, user)
//             if user.is_superuser:
//                 return redirect('/admin/')  # Admins go to admin panel
//             return redirect('/catalog/')  # Regular users go to catalog
//         else:
//             return render(request, 'login.html', {'error': 'Invalid credentials'})
//     return render(request, 'login.html')

// # def login_user(request):
// #     if request.method == "POST":
// #         try:
// #             data = json.loads(request.body)
// #             email = data.get("email")
// #             password = data.get("password")
// #             if not email or not password:
// #                 return JsonResponse({"success": False, "message": "Email and password required"}, status=400)

// #             # Authenticate using email
// #             user = authenticate(request, username=email, password=password)
// #             print("\nAuthenticated User:", user)
// #             if user is not None:
// #                 if user.is_active:
// #                     login(request, user,backend='myecommerce.auth_backends.EmailAuthBackend')
// #                     return JsonResponse({
// #                         "success": True,
// #                         "message": "Login successful",
// #                         "user": {
// #                             "username": user.username,
// #                             "email": user.email
// #                         }
// #                     })
// #                 else:
// #                     return JsonResponse({"success": False, "message": "Account is inactive"}, status=403)
// #             else:
// #                 print("Invalid credentials")
// #                 return JsonResponse({"success": False, "message": "Invalid credentials"}, status=400)

// #         except json.JSONDecodeError as e:
// #             print(f"JSON Error: {e}")
// #             return JsonResponse({"success": False, "message": "Invalid JSON format"}, status=400)

// #     return JsonResponse(request, 'login.html')

// @csrf_exempt
// def login_user(request):
//     if request.method == "POST":
//         is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
//         if is_ajax and request.headers.get('Content-Type') == 'application/json':
//             try:
//                 data = json.loads(request.body)
//                 email = data.get("email")
//                 password = data.get("password")
//             except json.JSONDecodeError:
//                 return JsonResponse({"success": False, "message": "Invalid JSON format"}, status=400)
//         else:
//             email = request.POST.get("email")
//             password = request.POST.get("password")

//         if not email or not password:
//             if is_ajax:
//                 return JsonResponse({"success": False, "message": "Email and password required"}, status=400)
//             return render(request, 'login.html', {'error': 'Email and password required'})
//         if request.user.is_authenticated:
//             if is_ajax:
//                 return JsonResponse({
//                     "success": False,
//                     "message": f"Already logged in as {request.user.username}. Please log out first."
//                 }, status=403)
//             return render(request, 'login.html', {'error': f"Already logged in as {request.user.username}. Please log out first."})

//         user = authenticate(request, username=email, password=password)
//         print("\nAuthenticated User:", user)

//         if user is not None:
//             if user.is_active:
//                 login(request, user , backend='myecommerce.auth_backends.EmailAuthBackend')
//                 redirect_url = '/admin/' if user.is_superuser else '/profile/'  # Changed to /profile/
//                 if is_ajax:
//                     return JsonResponse({
//                         "success": True,
//                         "message": "Login successful",
//                         "user": {"username": user.username, "email": user.email,"is_superuser": user.is_superuser},
//                         "redirect": redirect_url
//                     })
//                 return redirect(redirect_url)
//             else:
//                 if is_ajax:
//                     return JsonResponse({"success": False, "message": "Account is inactive"}, status=403)
//                 return render(request, 'login.html', {'error': 'Account is inactive'})
//         else:
//             if is_ajax:
//                 return JsonResponse({"success": False, "message": "Invalid credentials"}, status=400)          
//             return render(request, 'login.html', {'error': 'Invalid credentials'})

//     return render(request, 'login.html')

// # views.py
// @login_required
// def profile(request):
//     customer = request.user.customer
//     recent_orders = Order.objects.filter(customer=customer).order_by('-order_date')[:3]
//     all_orders = Order.objects.filter(customer=customer).order_by('-order_date')
//     wishlist_items = Wishlist.objects.filter(user=customer)
//     cart, created = Cart.objects.get_or_create(customer=customer)
//     cart_items = cart.items.all()  # Access CartItem via related_name
//     context = {
//         'customer': customer,
//         'recent_orders': recent_orders,
//         'all_orders': all_orders,
//         'wishlist_items': wishlist_items,
//         'cart_items': cart_items,
//     }
//     return render(request, 'profile.html', context)
    
// @login_required
// def update_profile(request):
//     if request.method == 'POST':
//         customer = request.user.customer
//         name = request.POST.get('name')
//         address = request.POST.get('address')
//         current_password = request.POST.get('current_password')
//         new_password = request.POST.get('new_password')

//         if name:
//             customer.name = name
//         if address:
//             customer.address = address
//         if current_password and new_password and request.user.check_password(current_password):
//             request.user.set_password(new_password)
//             request.user.save()
//             update_session_auth_hash(request, request.user)  # Keep user logged in
//         else:
//             return JsonResponse({'status': 'error', 'message': 'Invalid password'}, status=400)

//         customer.save()
//         return JsonResponse({'status': 'success', 'message': 'Profile updated'})
//     return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

// def test_auth(request):
//     print("Session:", request.session.items()) 
//     print("User:", request.user)
//     print("Authenticated:", request.user.is_authenticated)
//     return render(request, 'index.html') 

// def logout_user(request):
//     if request.method == 'POST':
//         logout(request)
//         return JsonResponse({'status': 'success', 'message': 'Logged out successfully'})
//     return redirect('/')

// # =========================
// # 📦 Order & Cart Management
// # =========================

// @user_required
// def cart(request):
//     customer = request.user.customer
//     cart, created = Cart.objects.get_or_create(customer=customer)
//     cart_items = cart.items.all()
//     return render(request, 'cart.html', {'cart_items': cart_items})

// @user_required
// def get_cart_items(request):
//     customer = request.user.customer
//     cart, created = Cart.objects.get_or_create(customer=customer)
//     cart_items = cart.items.all()
//     items_data = [
//         {
//             'id': item.product.product_id,
//             'name': item.product.name,
//             'category': item.product.category,
//             'price': float(item.product.price),
//             'quantity': item.quantity,
//             'image': item.product.image.url if item.product.image else 'https://via.placeholder.com/100x100',
//             'total_price': float(item.total_price())
//         } for item in cart_items
//     ]
//     return JsonResponse({'items': items_data})

// @login_required
// def add_to_cart(request):
//     if request.method == 'POST':
//         product_id = request.POST.get('product_id')
//         quantity = int(request.POST.get('quantity', 1))  # Default to 1 if not provided
//         product = get_object_or_404(Product, product_id=product_id)
//         customer = request.user.customer

//         # Get or create the user's cart
//         cart, created = Cart.objects.get_or_create(customer=customer)

//         # Check if the product is already in the cart
//         cart_item, item_created = CartItem.objects.get_or_create(
//             cart=cart,
//             product=product,
//             defaults={'quantity': quantity}
//         )
//         if not item_created:
//             cart_item.quantity += quantity
//             cart_item.save()

//         return JsonResponse({
//             'status': 'success',
//             'message': f'{product.name} added to cart',
//             'cart_item_count': cart.items.count()
//         })
//     return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
    
// @login_required
// def remove_from_cart(request):
//     if request.method == 'POST':
//         product_id = request.POST.get('product_id')
//         customer = request.user.customer
//         cart = Cart.objects.get(customer=customer)
//         cart_item = CartItem.objects.filter(cart=cart, product__product_id=product_id).first()
//         if cart_item:
//             cart_item.delete()
//             return JsonResponse({
//                 'status': 'success',
//                 'message': 'Item removed from cart',
//                 'cart_count': cart.items.count()
//             })
//         return JsonResponse({'status': 'error', 'message': 'Item not found'}, status=404)
//     return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

// @csrf_exempt
// def process_payment(request):
//     if request.method == "POST":
//         try:
//             data = json.loads(request.body)
//         except json.JSONDecodeError:
//             return JsonResponse({"success": False, "message": "Invalid JSON format!"}, status=400)
        
//         order_id = data.get("order_id")
//         payment_method = data.get("payment_method")
//         amount = data.get("amount")

//         try:
//             order = Order.objects.get(order_id=order_id)
//         except Order.DoesNotExist:
//             return JsonResponse({"success": False, "message": "Order not found!"}, status=400)

//         # Here, integrate with a real payment gateway if needed.
//         # For now, we'll simulate a successful payment:
//         payment = Payment.objects.create(
//             order=order,
//             payment_date=timezone.now().date(),
//             amount=amount,
//             payment_method=payment_method,
//             status="Paid"
//         )
//         payment.save()
//         return JsonResponse({"success": True, "message": "Payment processed successfully!"})
//     return JsonResponse({"success": False, "message": "Invalid request method"}, status=400)

// # =========================
// # 🎨 Custom Design Requests
// # =========================
// @csrf_exempt
// def create_design_request(request):
//     if request.method == "POST":
//         try:
//             data = json.loads(request.body)
//         except json.JSONDecodeError:
//             return JsonResponse({"success": False, "message": "Invalid JSON format!"}, status=400)
        
//         customer_id = data.get("customer_id")
//         details = data.get("details", "")
//         status = "Submitted"

//         try:
//             customer = Customer.objects.get(customer_id=customer_id)
//         except Customer.DoesNotExist:
//             return JsonResponse({"success": False, "message": "Customer not found!"}, status=400)
        
//         design_request = DesignRequest.objects.create(
//             customer=customer,
//             request_date=timezone.now().date(),
//             status=status,
//             details=details
//         )
//         design_request.save()
//         return JsonResponse({"success": True, "message": "Design request submitted successfully!"})
//     return JsonResponse({"success": False, "message": "Invalid request method"}, status=400)

// # =========================
// # ✂️ Tailor Registration
// # =========================
// @csrf_exempt
// def register_tailor(request):
//     if request.method == "POST":
//         try:
//             data = json.loads(request.body)
//         except json.JSONDecodeError:
//             return JsonResponse({"success": False, "message": "Invalid JSON format!"}, status=400)
        
//         name = data.get("name")
//         email = data.get("email")
//         password = data.get("password")
//         specialization = data.get("specialization", "")
        
//         if not (name and email and password):
//             return JsonResponse({"success": False, "message": "Please fill all required fields"}, status=400)
        
//         if Tailor.objects.filter(email=email).exists():
//             return JsonResponse({"success": False, "message": "Email already registered!"}, status=400)
        
//         tailor = Tailor.objects.create(
//             name=name,
//             email=email,
//             password=make_password(password),
//             specialization=specialization
//         )
//         tailor.save()
//         return JsonResponse({"success": True, "message": "Tailor registration successful!"})
//     return JsonResponse({"success": False, "message": "Invalid request method"}, status=400)

// # ==========================
// #       FRONTEND VIEWS
// # ==========================
// def index(request): return render(request, 'index.html')
// def bulk_order(request): return render(request, 'bulk-order.html')

// # def wishlist(request): return render(request, 'wishlist.html')
// # def catalog(request):
// #     products = Product.objects.all()  # Fetch all products
// #     return render(request, 'catalog.html', {'products': products})
// def chatbot(request): return render(request, 'chatbot.html')
// def contact(request): return render(request, 'contact.html')
// def custom_design(request): return render(request, 'custom-design.html')
// def product_detail(request,product_id):
//     product = Product.objects.get(id=product_id)
//     return render(request, 'product_detail.html', {'product': product})

// def tailor_jobs(request): return render(request, 'tailor-jobs.html')
// def virtual_tryon(request): return render(request, 'virtual-tryon.html')

// @login_required
// def checkout(request):
//     # Implement order creation logic here
//     return render(request, 'checkout.html')
