
// // Apple-like animations
// document.addEventListener("DOMContentLoaded", function() {
//     // Lazy load animations when elements come into view
//     const animateOnScroll = function() {
//         const elements = document.querySelectorAll('.fade-in');
        
//         elements.forEach(element => {
//             const elementTop = element.getBoundingClientRect().top;
//             const elementVisible = 150;
            
//             if (elementTop < window.innerHeight - elementVisible) {
//                 element.classList.add('active');
//             }
//         });
        
//         // Handle parallax effect
//         const parallaxSections = document.querySelectorAll('.parallax-section');
//         parallaxSections.forEach(section => {
//             const scrollPosition = window.pageYOffset;
//             section.style.backgroundPositionY = (scrollPosition * 0.5) + 'px';
//         });
        
//         // Sticky navbar effect
//         const navbar = document.querySelector('.navbar');
//         if (navbar && window.scrollY > 100) {
//             navbar.classList.add('scrolled');
//         } else if (navbar) {
//             navbar.classList.remove('scrolled');
//         }
//     };
    
//     // Initial check for elements in view
//     animateOnScroll();
    
//     // Listen for scroll events
//     window.addEventListener('scroll', animateOnScroll);
    
//     // Product image hover animations
//     const productImages = document.querySelectorAll('.product-image');
//     productImages.forEach(image => {
//         image.addEventListener('mouseenter', function() {
//             this.style.transform = 'scale(1.1)';
//         });
        
//         image.addEventListener('mouseleave', function() {
//             this.style.transform = 'scale(1)';
//         });
//     });
    
//     // Add fade-in class to elements that should animate when scrolled into view
//     const addFadeInClass = function() {
//         // Add to section headings
//         document.querySelectorAll('section h2').forEach(heading => {
//             heading.classList.add('fade-in');
//         });
        
//         // Add to product cards
//         document.querySelectorAll('.product-card').forEach((card, index) => {
//             card.classList.add('fade-in');
//             // Stagger the animation delay
//             card.style.transitionDelay = (index * 0.1) + 's';
//         });
        
//         // Add to category cards
//         document.querySelectorAll('.category-card').forEach((card, index) => {
//             card.classList.add('fade-in');
//             card.style.transitionDelay = (index * 0.1) + 's';
//         });
//     };
    
//     // Call the function to add classes
//     addFadeInClass();
    
//     // Smooth scroll for anchor links
//     document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//         anchor.addEventListener('click', function(e) {
//             e.preventDefault();
            
//             const target = document.querySelector(this.getAttribute('href'));
//             if (target) {
//                 target.scrollIntoView({
//                     behavior: 'smooth'
//                 });
//             }
//         });
//     });
// });
