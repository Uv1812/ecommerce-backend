from django.contrib import admin
from .models import Wishlist,Tailor, Customer,CartItem ,DesignRequest, Order,Product,CustomDesign,Payment,DesignSubmission,SelectedDesign,Cart
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

# Register your models here.
admin.site.register(Tailor)
admin.site.register(Wishlist)
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(Customer)
admin.site.register(DesignRequest)
admin.site.register(Order)
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "category")  # Shows these fields in the product list
    search_fields = ("name", "category")  # Enables search by name and category
    list_filter = ("category",) 
admin.site.register(CustomDesign)
admin.site.register(Payment)
admin.site.register(DesignSubmission)
admin.site.register(SelectedDesign)
admin.site.register(Cart)
admin.site.register(CartItem)

