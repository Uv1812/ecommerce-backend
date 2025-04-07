from django.shortcuts import render,redirect, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login,logout,get_user,update_session_auth_hash,get_user_model
from django.http import JsonResponse,HttpResponse
from django.contrib.auth.forms import AuthenticationForm
from django.views.decorators.csrf import csrf_exempt,csrf_protect
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
import json
import random
import string
import logging
from django.conf import settings
from django.core.mail import send_mail
from django.views import View
from django.utils.decorators import method_decorator
from django.db import IntegrityError
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib import messages
from .models import Customer,Product, Wishlist,Tailor,Order,Payment,Cart,CartItem,DesignRequest
from .forms import TailorForm  # ✅ Add this line

logger = logging.getLogger(__name__)
User = get_user_model()
# ==========================
#       ADMIN VIEWS
# ==========================
def generate_otp(length=6):
    """Generate a random OTP."""
    return ''.join(random.choices(string.digits, k=length))

@csrf_exempt
def forgot_password(request):
    if request.method == "POST":
        email = request.POST.get('email')
        logger.info(f"Forgot password request for email: {email}")
        try:
            user = User.objects.filter(email=email).first()
            if not user:
                logger.warning(f"Email not registered: {email}")
                return JsonResponse({'success': False, 'message': 'Email not registered.'}, status=400)

            otp = generate_otp()
            request.session['reset_otp'] = otp
            request.session['reset_email'] = email
            request.session.set_expiry(300)

            subject = 'Password Reset OTP - Bhavi India Fashion'
            message = f'Your OTP for password reset is: {otp}. It is valid for 5 minutes.'
            recipient_list = [email]  # Explicitly log recipient
            logger.info(f"Sending OTP {otp} to {recipient_list}")
            response = send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipient_list,
                fail_silently=False,
            )
            logger.info(f"OTP sent successfully to {recipient_list}. Response: {response}")
            return JsonResponse({'success': True, 'message': 'OTP sent to your email.'})
        except Exception as e:
            logger.error(f"Error sending OTP to {email}: {str(e)}")
            return JsonResponse({'success': False, 'message': f'Error sending OTP: {str(e)}'}, status=500)
    return JsonResponse({'success': False, 'message': 'Invalid request.'}, status=400)
    
@csrf_exempt
def reset_password(request):
    if request.method == "POST":
        otp = request.POST.get('otp')
        new_password = request.POST.get('new_password')
        stored_otp = request.session.get('reset_otp')
        email = request.session.get('reset_email')

        if not stored_otp or not email:
            return JsonResponse({'success': False, 'message': 'Session expired. Please request a new OTP.'}, status=400)

        if otp == stored_otp:
            try:
                user = User.objects.filter(email=email).first()
                if not user:
                    return JsonResponse({'success': False, 'message': 'User not found.'}, status=400)
                user.set_password(new_password)
                user.save()
                del request.session['reset_otp']
                del request.session['reset_email']
                return JsonResponse({'success': True, 'message': 'Password reset successfully.'})
            except Exception as e:
                logger.error(f"Error resetting password for {email}: {str(e)}")
                return JsonResponse({'success': False, 'message': 'Error resetting password.'}, status=500)
        else:
            return JsonResponse({'success': False, 'message': 'Invalid OTP.'}, status=400)
    return JsonResponse({'success': False, 'message': 'Invalid request.'}, status=400)
    
def user_required(view_func):
    """Decorator to ensure only non-superusers (regular users) can access the view."""
    @login_required
    def wrapper(request, *args, **kwargs):
        if request.user.is_superuser:
            return redirect('/admin/')  # Redirect admins to admin panel
        return view_func(request, *args, **kwargs)
    return wrapper

# def get_customer_data(request):
#     customers = Customer.objects.all()
    
#     # Prepare data in the format DataTables expects
#     data = [
#         {
#             'id': customer.Customerid,
#             'name': customer.name,
#             'email': customer.email,
#             'phone': customer.phone,
#             'joinedDate': customer.joined_date.strftime('%Y-%m-%d')  # Format the date as needed
#         }
#         for customer in customers
#     ]
    
#     # Return data as JSON
#     return JsonResponse({'data': data})

# ==========================
#       USER MANAGEMENT
# ==========================
@receiver(post_save, sender=User)
def create_customer_for_user(sender, instance, created, **kwargs):
    if created:
        name = instance.username if instance.username else instance.email
        Customer.objects.create(user=instance, email=instance.email, name=name)

@receiver(post_save, sender=User)
def save_customer_for_user(sender, instance, **kwargs):
    try:
        instance.customer.save()
    except Customer.DoesNotExist:
        name = instance.username if instance.username else instance.email
        Customer.objects.create(user=instance, email=instance.email, name=name)


 # ==========================
#       ORDER MANAGEMENT
# ==========================

#========================
#       TAILOR MANAGEMENT
# ==========================


# ==========================
#       PRODUCT MANAGEMENT
# ==========================
@login_required
def wishlist(request):
    return render(request, 'wishlist.html')

@csrf_exempt
@login_required
def add_to_wishlist(request):
    if request.method == "POST":
        print("hello")
        try:
            if request.content_type == 'application/json' and request.body:
                data = json.loads(request.body)
            else:
                data = request.POST

            product_id = data.get('product_id')
            if not product_id:
                logger.error("No product_id provided in request")
                return JsonResponse({'status': 'error', 'message': 'Product ID is required'}, status=400)

            customer = Customer.objects.get(user=request.user)
            product = Product.objects.get(product_id=product_id)
            
            if not Wishlist.objects.filter(user=customer, product=product).exists():
                Wishlist.objects.create(user=customer, product=product)
                logger.info(f"Added product {product_id} to wishlist for {customer.email}")
            
            wishlist_count = Wishlist.objects.filter(user=customer).count()
            return JsonResponse({
                'status': 'success',
                'message': 'Product added to wishlist!',
                'wishlist_count': wishlist_count
            })
        except Product.DoesNotExist:
            logger.error(f"Product with ID {product_id} not found")
            return JsonResponse({'status': 'error', 'message': 'Product not found'}, status=404)
        except Customer.DoesNotExist:
            logger.error(f"Customer not found for user {request.user.email}")
            return JsonResponse({'status': 'error', 'message': 'User profile not found'}, status=403)
        except Exception as e:
            logger.error(f"Error adding to wishlist: {str(e)}")
            return JsonResponse({'status': 'error', 'message': f'Server error: {str(e)}'}, status=500)
    logger.warning("Invalid request method for add_to_wishlist")
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@login_required
def wishlist_items(request):
    try:
        customer = Customer.objects.get(user=request.user)
        wishlist_items = Wishlist.objects.filter(user=customer).select_related('product')
        items = [
            {
                'id': item.product.product_id,
                'name': item.product.name,
                'price': str(item.product.price),
                'category': item.product.category,
                'image': item.product.image.url if item.product.image else '/static/images/placeholder.jpg'
            } for item in wishlist_items
        ]
        return JsonResponse({'items': items})
    except Customer.DoesNotExist:
        return JsonResponse({'items': []}, status=403)

# @method_decorator(login_required, name='dispatch')
# class WishlistItemsView(View):
#     def get(self, request):
#         wishlist_items = Wishlist.objects.filter(user=request.user).select_related('product')
#         items = [
#             {
#                 "id": item.product.id,
#                 "name": item.product.name,
#                 "category": item.product.category.name,
#                 "price": item.product.price,
#                 "image": item.product.image.url if item.product.image else ""
#             }
#             for item in wishlist_items
#         ]
#         return JsonResponse({"items": items})

# @login_required
# def wishlist_items(request):
#     try:
#         customer = Customer.objects.get(user=request.user)  # Get logged-in customer
#         wishlist = Wishlist.objects.filter(user=customer)  # Fetch wishlist items

#         items = []
#         if wishlist.exists():  # Ensure there are items before looping
#             for item in wishlist:
#                 try:
#                     product = item.product  # Get product details
#                     customer_obj = Customer.objects.get(CustomerId=item.user_id)  # Fetch full customer object

#                     items.append({
#                         "id": product.product_id,
#                         "name": product.name,
#                         "price": product.price,
#                         "image": product.image.url if product.image else "/static/images/uv.jpg",
#                         "category": product.category.name if product.category else "Uncategorized",
#                     })
#                 except Customer.DoesNotExist:
#                     print(f"Error: Customer not found for user_id {item.user_id}")
#                 except AttributeError as e:
#                     print(f"Error processing wishlist item: {e}")

#         return JsonResponse({"items": items})
    
#     except Customer.DoesNotExist:
#         return JsonResponse({"error": "Customer not found"}, status=404)
#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@login_required
def remove_from_wishlist(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body) if request.body else request.POST
            product_id = data.get('product_id')
            customer = Customer.objects.get(user=request.user)
            product = Product.objects.get(product_id=product_id)

            wishlist_item = Wishlist.objects.filter(user=customer, product=product)
            if wishlist_item.exists():
                wishlist_item.delete()
                logger.info(f"Removed product {product_id} from wishlist for {customer.email}")
            
            wishlist_count = Wishlist.objects.filter(user=customer).count()
            return JsonResponse({
                'status': 'success',
                'message': 'Product removed from wishlist',
                'wishlist_count': wishlist_count
            })
        except (Product.DoesNotExist, Customer.DoesNotExist):
            return JsonResponse({'status': 'error', 'message': 'Invalid product or user'}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

def catalog_view(request):
    products = Product.objects.all()

    selected_categories = request.GET.getlist("category")
    if selected_categories:
        products = products.filter(category__in=selected_categories)
    
    # Filtering by price range
    min_price = request.GET.get("minPrice")
    max_price = request.GET.get("maxPrice")
    if min_price:
        products = products.filter(price__gte=min_price)
    if max_price:
        products = products.filter(price__lte=max_price)

    sort_by = request.GET.get("sortBy", "featured")
    if sort_by == "price_asc":
        products = products.order_by("price")
    elif sort_by == "price_desc":
        products = products.order_by("-price")

    context = {
        "products": products,  # QuerySet,  list
        "selected_categories": selected_categories,
        "min_price": min_price,
        "max_price": max_price,
        "sort_by": sort_by,
    }

    return render(request, "catalog.html", context)

def index_view(request):
    featured_products = Product.objects.all()[:4]  # Show only the first 6 products
    return render(request, 'index.html', {'products': featured_products})


# =========================
# 🔐 User Authentication Views
# =========================
def check_auth_status(request):
    print(f"Auth Status - Port: {request.META.get('SERVER_PORT')}, User: {request.user}, Auth: {request.user.is_authenticated}")
    if request.user.is_authenticated:
        return JsonResponse({
            "is_authenticated": True,
            "username": request.user.username,
            "is_superuser": request.user.is_superuser,
            "logged_in_via_form": request.session.get('logged_in_via_form', False)
        })
    return JsonResponse({"is_authenticated": False})

@login_required
def get_user_data(request):
    user = request.user
    return JsonResponse({
        'username': user.username,
        'email': user.email,
        'phone': user.profile.phone if hasattr(user, 'profile') else None
    })
def get_username(request):
    if request.user.is_authenticated:
        return JsonResponse({'username': request.user.username})
    return JsonResponse({'username': None}, status=401)

@csrf_exempt
def user_register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
            print("Received data:", data)  # ✅ Debugging print
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid JSON format!"}, status=400)

        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        confirm_password = data.get("confirm_password")

        if not (username and email and password and confirm_password):
            return JsonResponse({"success": False, "message": "All fields are required!"}, status=400)

        if password != confirm_password:
            return JsonResponse({"success": False, "message": "Passwords do not match!"}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({"success": False, "message": "Username already taken!"}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({"success": False, "message": "Email is already registered!"}, status=400)

        # ✅ Create the user and save to database
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()

        print("User created successfully!")  # ✅ Debugging print

        return JsonResponse({"success": True, "message": "Registration successful! You can now log in."})

    return JsonResponse({"success": False, "message": "Invalid request"}, status=400)

def authenticate_with_email(request, email, password):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        user = User.objects.get(email=email)
        if user.check_password(password):
            user.backend = 'myecommerce.auth_backends.EmailAuthBackend'
            return user
    except User.DoesNotExist:
        return None

@csrf_exempt
def custom_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            if user.is_superuser:
                return redirect('/admin/')  # Admins go to admin panel
            return redirect('/catalog/')  # Regular users go to catalog
        else:
            return render(request, 'login.html', {'error': 'Invalid credentials'})
    return render(request, 'login.html')

# def login_user(request):
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)
#             email = data.get("email")
#             password = data.get("password")
#             if not email or not password:
#                 return JsonResponse({"success": False, "message": "Email and password required"}, status=400)

#             # Authenticate using email
#             user = authenticate(request, username=email, password=password)
#             print("\nAuthenticated User:", user)
#             if user is not None:
#                 if user.is_active:
#                     login(request, user,backend='myecommerce.auth_backends.EmailAuthBackend')
#                     return JsonResponse({
#                         "success": True,
#                         "message": "Login successful",
#                         "user": {
#                             "username": user.username,
#                             "email": user.email
#                         }
#                     })
#                 else:
#                     return JsonResponse({"success": False, "message": "Account is inactive"}, status=403)
#             else:
#                 print("Invalid credentials")
#                 return JsonResponse({"success": False, "message": "Invalid credentials"}, status=400)

#         except json.JSONDecodeError as e:
#             print(f"JSON Error: {e}")
#             return JsonResponse({"success": False, "message": "Invalid JSON format"}, status=400)

#     return JsonResponse(request, 'login.html')

@csrf_exempt
def login_user(request):
    if request.method == "POST":
        print(f"Login - Port: {request.META.get('SERVER_PORT')}, User: {request.user}")
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        if is_ajax and request.headers.get('Content-Type') == 'application/json':
            try:
                data = json.loads(request.body)
                email = data.get("email")
                password = data.get("password")
            except json.JSONDecodeError:
                return JsonResponse({"success": False, "message": "Invalid JSON format"}, status=400)
        else:
            email = request.POST.get("email")
            password = request.POST.get("password")

        if not email or not password:
            if is_ajax:
                return JsonResponse({"success": False, "message": "Email and password required"}, status=400)
            return render(request, 'login.html', {'error': 'Email and password required'})
        
        is_form_login = request.session.get('logged_in_via_form', False)
        if request.user.is_authenticated and is_form_login:
            if is_ajax:
                return JsonResponse({
                    "success": False,
                    "message": f"Already logged in as {request.user.username}. Please log out first."
                }, status=403)
            return render(request, 'login.html', {'error': f"Already logged in as {request.user.username}. Please log out first."})

        user = authenticate(request, username=email, password=password)
        print("\nAuthenticated User:", user)

        if user is not None:
            if user.is_active:
                login(request, user , backend='myecommerce.auth_backends.EmailAuthBackend')
                request.session['logged_in_via_form'] = True
                redirect_url = '/admin/' if user.is_superuser else ''  # Changed to /profile/
                if is_ajax:
                    return JsonResponse({
                        "success": True,
                        "message": "Login successful",
                        "user": {"username": user.username, "email": user.email,"is_superuser": user.is_superuser},
                        "redirect": redirect_url
                    })
                return redirect(redirect_url)
            else:
                if is_ajax:
                    return JsonResponse({"success": False, "message": "Account is inactive"}, status=403)
                return render(request, 'login.html', {'error': 'Account is inactive'})
        else:
            if is_ajax:
                return JsonResponse({"success": False, "message": "Invalid credentials"}, status=400)          
            return render(request, 'login.html', {'error': 'Invalid credentials'})

    else:  # GET request
        next_url = request.GET.get('next', '/')
        return render(request, 'login.html', {'next': next_url})

# views.py
@login_required
def profile(request):
    customer = request.user.customer
    recent_orders = Order.objects.filter(customer=customer).order_by('-order_date')[:3]
    all_orders = Order.objects.filter(customer=customer).order_by('-order_date')
    wishlist_items = Wishlist.objects.filter(user=customer)
    cart, created = Cart.objects.get_or_create(customer=customer)
    cart_items = cart.items.all()  # Access CartItem via related_name
    context = {
        'customer': customer,
        'recent_orders': recent_orders,
        'all_orders': all_orders,
        'wishlist_items': wishlist_items,
        'cart_items': cart_items,
    }
    return render(request, 'profile.html', context)
    
@login_required
def update_profile(request):
    if request.method == 'POST':
        customer = request.user.customer
        name = request.POST.get('name')
        address = request.POST.get('address')
        current_password = request.POST.get('current_password')
        new_password = request.POST.get('new_password')

        if name:
            customer.name = name
        if address:
            customer.address = address
        if current_password and new_password and request.user.check_password(current_password):
            request.user.set_password(new_password)
            request.user.save()
            update_session_auth_hash(request, request.user)  # Keep user logged in
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid password'}, status=400)

        customer.save()
        return JsonResponse({'status': 'success', 'message': 'Profile updated'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

def test_auth(request):
    print("Session:", request.session.items()) 
    print("User:", request.user)
    print("Authenticated:", request.user.is_authenticated)
    return render(request, 'index.html') 

def logout_user(request):
    print(f"Logout - Port: {request.META.get('SERVER_PORT')}, User before logout: {request.user}")
    if request.method == "POST":
        logout(request)
        if 'logged_in_via_form' in request.session:
            del request.session['logged_in_via_form']
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({"status": "success", "message": "Logged out successfully"})
        return redirect('/')
    return redirect('/')

# =========================
# 📦 Order & Cart Management
# =========================

@user_required
def cart(request):
    customer = request.user.customer
    cart, created = Cart.objects.get_or_create(customer=customer)
    cart_items = cart.items.all()
    return render(request, 'cart.html', {'cart_items': cart_items})

@user_required
def get_cart_items(request):
    customer = request.user.customer
    cart, created = Cart.objects.get_or_create(customer=customer)
    cart_items = cart.items.all()
    items_data = [
        {
            'id': item.product.product_id,
            'name': item.product.name,
            'category': item.product.category,
            'price': float(item.product.price),
            'quantity': item.quantity,
            'image': item.product.image.url if item.product.image else 'https://via.placeholder.com/100x100',
            'total_price': float(item.total_price())
        } for item in cart_items
    ]
    return JsonResponse({'items': items_data})

@login_required
def add_to_cart(request):
    if request.method == 'POST':
        product_id = request.POST.get('product_id')
        quantity = int(request.POST.get('quantity', 1))  # Default to 1 if not provided
        product = get_object_or_404(Product, product_id=product_id)
        customer = request.user.customer

        # Get or create the user's cart
        cart, created = Cart.objects.get_or_create(customer=customer)

        # Check if the product is already in the cart
        cart_item, item_created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        if not item_created:
            cart_item.quantity += quantity
            cart_item.save()

        return JsonResponse({
            'status': 'success',
            'message': f'{product.name} added to cart',
            'cart_item_count': cart.items.count()
        })
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
    
@login_required
def remove_from_cart(request):
    if request.method == 'POST':
        product_id = request.POST.get('product_id')
        customer = request.user.customer
        cart = Cart.objects.get(customer=customer)
        cart_item = CartItem.objects.filter(cart=cart, product__product_id=product_id).first()
        if cart_item:
            cart_item.delete()
            return JsonResponse({
                'status': 'success',
                'message': 'Item removed from cart',
                'cart_count': cart.items.count()
            })
        return JsonResponse({'status': 'error', 'message': 'Item not found'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@csrf_exempt
def process_payment(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid JSON format!"}, status=400)
        
        order_id = data.get("order_id")
        payment_method = data.get("payment_method")
        amount = data.get("amount")

        try:
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return JsonResponse({"success": False, "message": "Order not found!"}, status=400)

        # Here, integrate with a real payment gateway if needed.
        # For now, we'll simulate a successful payment:
        payment = Payment.objects.create(
            order=order,
            payment_date=timezone.now().date(),
            amount=amount,
            payment_method=payment_method,
            status="Paid"
        )
        payment.save()
        return JsonResponse({"success": True, "message": "Payment processed successfully!"})
    return JsonResponse({"success": False, "message": "Invalid request method"}, status=400)

# =========================
# 🎨 Custom Design Requests
# =========================
@csrf_exempt
def create_design_request(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid JSON format!"}, status=400)
        
        customer_id = data.get("customer_id")
        details = data.get("details", "")
        status = "Submitted"

        try:
            customer = Customer.objects.get(customer_id=customer_id)
        except Customer.DoesNotExist:
            return JsonResponse({"success": False, "message": "Customer not found!"}, status=400)
        
        design_request = DesignRequest.objects.create(
            customer=customer,
            request_date=timezone.now().date(),
            status=status,
            details=details
        )
        design_request.save()
        return JsonResponse({"success": True, "message": "Design request submitted successfully!"})
    return JsonResponse({"success": False, "message": "Invalid request method"}, status=400)

# =========================
# ✂️ Tailor Registration
# =========================
@csrf_exempt
def register_tailor(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid JSON format!"}, status=400)
        
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        specialization = data.get("specialization", "")
        
        if not (name and email and password):
            return JsonResponse({"success": False, "message": "Please fill all required fields"}, status=400)
        
        if Tailor.objects.filter(email=email).exists():
            return JsonResponse({"success": False, "message": "Email already registered!"}, status=400)
        
        tailor = Tailor.objects.create(
            name=name,
            email=email,
            password=make_password(password),
            specialization=specialization
        )
        tailor.save()
        return JsonResponse({"success": True, "message": "Tailor registration successful!"})
    return JsonResponse({"success": False, "message": "Invalid request method"}, status=400)

# ==========================
#       FRONTEND VIEWS
# ==========================
def index(request): return render(request, 'index.html')
def bulk_order(request): return render(request, 'bulk-order.html')

# def wishlist(request): return render(request, 'wishlist.html')
# def catalog(request):
#     products = Product.objects.all()  # Fetch all products
#     return render(request, 'catalog.html', {'products': products})
def chatbot(request): return render(request, 'chatbot.html')
def contact(request): return render(request, 'contact.html')

def custom_design(request): return render(request, 'custom-design.html')
def product_detail(request,product_id):
    product = Product.objects.get(id=product_id)
    return render(request, 'product_detail.html', {'product': product})

def tailor_jobs(request): return render(request, 'tailor-jobs.html')
def virtual_tryon(request): return render(request, 'virtual-tryon.html')

@login_required
def checkout(request):
    # Implement order creation logic here
    return render(request, 'checkout.html')
