from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
# from .views import (catalog, list_tailors, admin_tailors_list, delete_tailor, edit_tailor, 
#                     edit_order, delete_order, order_detail, admin_profile, list_products, 
#                     list_payments, admin_login, admin_logout, list_users, add_user, 
#                     edit_user, delete_user, admin_dashboard, index, user_register, 
#                     add_to_cart, process_payment, create_design_request, register_tailor, 
#                     create_order, list_orders)

urlpatterns = [
     path('', views.index_view, name='index'),
     path('register/', views.user_register, name='register'),
     # path('api/data/', views.get_customer_data, name='get_customer_data'),
     path('login/', views.login_user, name='login_user'),
     path('test-auth/', views.test_auth, name='test_auth'),
     path('logout/', views.logout_user, name='logout_user'),
     path('get-user/', views.get_user_data, name='get-user'),
     path('forgot_password/', views.forgot_password, name='forgot_password'),
     path('reset_password/', views.reset_password, name='reset_password'),
     path('get-username/', views.get_username, name='get_username'),
     path('auth-status/', views.check_auth_status, name='auth_status'),
     # path('orders/create/', views.create_order, name='create_order'),
     # path('orders/', views.list_orders, name='list_orders'),
     # path('orders/<int:order_id>/', order_detail, name='order_detail'),
     # path('orders/<int:order_id>/edit/', edit_order, name='edit_order'), 
     # path('orders/<int:order_id>/delete/', delete_order, name='delete_order'),
     path('bulk-order/', views.bulk_order, name='bulk_order'),
     path('cart/', views.cart, name='cart'),
     path('cart/items/', views.get_cart_items, name='cart_items'),
     path("cart/add/", views.add_to_cart, name="add_to_cart"),
     path("cart/remove/", views.remove_from_cart, name="remove_from_cart"),
     path('catalog/', views.catalog_view, name='catalog'),
     
     # path('designrequest/create/', create_design_request, name='create_design_request'),
     path('chatbot/', views.chatbot, name='chatbot'),
     path("wishlist/items/", views.wishlist_items, name="wishlist_items"),
     path("add_to_wishlist/", views.add_to_wishlist, name="add_to_wishlist"),
     path("remove_from_wishlist", views.remove_from_wishlist, name="remove_from_wishlist"),
     path('contact/', views.contact, name='contact'),
     # path('tailor/register/', register_tailor, name='register_tailor'),
     path('custom-design/', views.custom_design, name='custom_design'),
     path('product-detail', views.product_detail, name='product_detail'),
     path('profile/', views.profile, name='profile'),
     path('update-profile/', views.update_profile, name='update_profile'),
     path('tailor-jobs/', views.tailor_jobs, name='tailor_jobs'),
     path('virtual-tryon/', views.virtual_tryon, name='virtual_tryon'),
     path('wishlist/', views.wishlist, name='wishlist'),
     path('checkout/', views.checkout, name='checkout'),
     # path("get-counts/", views.get_counts, name="get_counts"),
     # path('payment/process/', process_payment, name='process_payment'),
]
