
$(document).ready(function() {
    let stream = null;
    let isAdjustingPosition = false;
    let isAdjustingSize = false;
    let productOverlay = null;
    let overlayX = 0;
    let overlayY = 0;
    let overlayScale = 1;
    let isDragging = false;
    let startX, startY;
    let lastX, lastY;
    
    // Product items filter
    $('#product-category').change(function() {
        const category = $(this).val();
        if (category) {
            $('.product-item').hide();
            $(`.product-item[data-category="${category}"]`).show();
        } else {
            $('.product-item').show();
        }
    });
    
    // Upload photo button
    $('#upload-photo').click(function() {
        $('#photo-upload').click();
    });
    
    // Handle file upload
    $('#photo-upload').change(function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(event) {
                stopWebcam();
                $('#placeholder-msg').addClass('d-none');
                $('#user-image').attr('src', event.target.result).removeClass('d-none');
                $('#webcam').addClass('d-none');
                $('#webcam-controls').addClass('d-none');
                $('#photo-controls').removeClass('d-none');
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Use webcam button
    $('#use-webcam').click(function() {
        startWebcam();
    });
    
    // Capture photo button
    $('#capture-photo').click(function() {
        capturePhoto();
    });
    
    // Stop webcam button
    $('#stop-webcam').click(function() {
        stopWebcam();
        $('#placeholder-msg').removeClass('d-none');
    });
    
    // Reset photo button
    $('#reset-photo').click(function() {
        $('#user-image').addClass('d-none').attr('src', '');
        $('#placeholder-msg').removeClass('d-none');
        $('#photo-controls').addClass('d-none');
        $('#try-on-controls').addClass('d-none');
        $('#overlay-canvas').addClass('d-none');
        
        // Reset overlay properties
        overlayX = 0;
        overlayY = 0;
        overlayScale = 1;
        
        // Clear canvas
        const canvas = document.getElementById('overlay-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    
    // Try on buttons
    $('.try-on-btn').click(function() {
        const productId = $(this).data('product-id');
        
        // Check if user has uploaded a photo
        if ($('#user-image').hasClass('d-none') && $('#webcam').hasClass('d-none')) {
            showNotification('Please upload a photo or use webcam first', 'warning');
            return;
        }
        
        // Simulate product overlay
        productOverlay = new Image();
        
        // Use different overlay images based on product ID
        // In a real app, these would be transparent PNGs of the products
        if (productId === 1) {
            productOverlay.src = 'https://via.placeholder.com/400x600';
        } else if (productId === 2) {
            productOverlay.src = 'https://via.placeholder.com/400x300';
        } else {
            productOverlay.src = 'https://via.placeholder.com/500x500';
        }
        
        productOverlay.onload = function() {
            const canvas = document.getElementById('overlay-canvas');
            canvas.width = $('#photo-container').width();
            canvas.height = $('#photo-container').height();
            
            // Center the overlay initially
            overlayX = (canvas.width - productOverlay.width * overlayScale) / 2;
            overlayY = (canvas.height - productOverlay.height * overlayScale) / 2;
            
            // Draw the overlay
            drawOverlay();
            
            $('#overlay-canvas').removeClass('d-none');
            $('#try-on-controls').removeClass('d-none');
        };
        
        showNotification('Product overlay applied!', 'success');
    });
    
    // Adjust position button
    $('#adjust-position').click(function() {
        if (isAdjustingPosition) {
            $(this).removeClass('active');
            isAdjustingPosition = false;
        } else {
            $(this).addClass('active');
            $('#adjust-size').removeClass('active');
            isAdjustingPosition = true;
            isAdjustingSize = false;
        }
    });
    
    // Adjust size button
    $('#adjust-size').click(function() {
        if (isAdjustingSize) {
            $(this).removeClass('active');
            isAdjustingSize = false;
        } else {
            $(this).addClass('active');
            $('#adjust-position').removeClass('active');
            isAdjustingSize = true;
            isAdjustingPosition = false;
        }
    });
    
    // Remove overlay button
    $('#remove-overlay').click(function() {
        $('#overlay-canvas').addClass('d-none');
        $('#try-on-controls').addClass('d-none');
        
        // Reset overlay properties
        overlayX = 0;
        overlayY = 0;
        overlayScale = 1;
        
        // Clear canvas
        const canvas = document.getElementById('overlay-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    
    // Save image button
    $('#save-image').click(function() {
        // In a real app, this would combine the user photo and overlay
        // and allow downloading or sharing
        showNotification('Image saved successfully!', 'success');
    });
    
    // Canvas mouse events for adjusting the overlay
    $('#overlay-canvas').on('mousedown', function(e) {
        if (!productOverlay) return;
        
        isDragging = true;
        startX = e.offsetX;
        startY = e.offsetY;
        lastX = overlayX;
        lastY = overlayY;
    });
    
    $(document).on('mousemove', function(e) {
        if (!isDragging || !productOverlay) return;
        
        const canvas = document.getElementById('overlay-canvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (isAdjustingPosition) {
            overlayX = lastX + (x - startX);
            overlayY = lastY + (y - startY);
            drawOverlay();
        } else if (isAdjustingSize) {
            // Adjust scale based on vertical movement
            const scaleFactor = 1 + (y - startY) / 200;
            overlayScale = Math.max(0.2, Math.min(3, lastX * scaleFactor));
            drawOverlay();
        }
    });
    
    $(document).on('mouseup', function() {
        isDragging = false;
    });
    
    // Function to draw the overlay on the canvas
    function drawOverlay() {
        if (!productOverlay) return;
        
        const canvas = document.getElementById('overlay-canvas');
        const ctx = canvas.getContext('2d');
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the overlay with the current position and scale
        ctx.globalAlpha = 0.8; // Make it slightly transparent for better integration
        ctx.drawImage(
            productOverlay,
            overlayX,
            overlayY,
            productOverlay.width * overlayScale,
            productOverlay.height * overlayScale
        );
    }
    
    // Function to start the webcam
    function startWebcam() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(videoStream) {
                    stream = videoStream;
                    const video = document.getElementById('webcam');
                    video.srcObject = videoStream;
                    
                    $('#placeholder-msg').addClass('d-none');
                    $('#user-image').addClass('d-none');
                    $('#webcam').removeClass('d-none');
                    $('#webcam-controls').removeClass('d-none');
                    $('#photo-controls').addClass('d-none');
                })
                .catch(function(error) {
                    console.error('Error accessing webcam:', error);
                    showNotification('Error accessing webcam. Please check permissions.', 'danger');
                });
        } else {
            showNotification('Your browser does not support webcam access', 'danger');
        }
    }
    
    // Function to stop the webcam
    function stopWebcam() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        
        $('#webcam').addClass('d-none');
        $('#webcam-controls').addClass('d-none');
    }
    
    // Function to capture photo from webcam
    function capturePhoto() {
        const video = document.getElementById('webcam');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataURL = canvas.toDataURL('image/png');
        $('#user-image').attr('src', dataURL).removeClass('d-none');
        $('#webcam').addClass('d-none');
        $('#webcam-controls').addClass('d-none');
        $('#photo-controls').removeClass('d-none');
        
        stopWebcam();
    }
    
    // Notification helper
    function showNotification(message, type) {
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'warning' ? 'alert-warning' : 'alert-danger';
                          
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
    
    // Handle mobile touch events
    $('#overlay-canvas').on('touchstart', function(e) {
        if (!productOverlay) return;
        
        isDragging = true;
        const touch = e.originalEvent.touches[0];
        const rect = this.getBoundingClientRect();
        startX = touch.clientX - rect.left;
        startY = touch.clientY - rect.top;
        lastX = overlayX;
        lastY = overlayY;
        
        e.preventDefault();
    });
    
    $(document).on('touchmove', function(e) {
        if (!isDragging || !productOverlay) return;
        
        const touch = e.originalEvent.touches[0];
        const canvas = document.getElementById('overlay-canvas');
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        if (isAdjustingPosition) {
            overlayX = lastX + (x - startX);
            overlayY = lastY + (y - startY);
            drawOverlay();
        } else if (isAdjustingSize) {
            const scaleFactor = 1 + (y - startY) / 200;
            overlayScale = Math.max(0.2, Math.min(3, lastX * scaleFactor));
            drawOverlay();
        }
        
        e.preventDefault();
    });
    
    $(document).on('touchend', function() {
        isDragging = false;
    });
});
