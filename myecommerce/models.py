from django.db import models
from django.contrib.auth.models import User


class Admin(models.Model):
    admin_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=50)

class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer', db_column='user_id')
    CustomerId = models.AutoField(primary_key=True, db_column='CustomerId')  # Correct indentation
    name = models.CharField(max_length=50, null=False, blank=False,db_column="Name")
    email = models.EmailField(unique=True, null=False, db_column="Email")
    password = models.CharField(max_length=50, null=False, db_column="Password")
    customer_type = models.CharField(
        max_length=20, 
        choices=[
            ('Individual', 'Individual'), 
            ('Retailer', 'Retailer'), 
            ('Wholesaler', 'Wholesaler')
        ],
       default='Individual', 
       db_column='CustomerType'  
    )
    address = models.CharField(max_length=100, null=False,db_column="Address")

    def __str__(self):
        return self.user.username

    class Meta:
        db_table = "myecommerce_customer"  


class Tailor(models.Model):
    tailor_id = models.AutoField(primary_key=True, db_column="TailorID")
    name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=50)
    specialization = models.CharField(max_length=50)

    class Meta:
        db_table = "tailor"  # Ensure Django maps to the correct table

class Order(models.Model):
    order_id = models.AutoField(primary_key=True, db_column="OrderID")
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, db_column="CustomerId")
    order_date = models.DateField(db_column="OrderDate")
    status = models.CharField(
        max_length=50, 
        choices=[('Pending', 'Pending'), ('Approved', 'Approved'), ('Completed', 'Completed'), ('Cancelled', 'Cancelled')],
        db_column="Status"
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, db_column="TotalAmount")

    class Meta:
        db_table = "orders"  # Ensure Django maps this model to the correct table

class Product(models.Model):
    product_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100, choices=[
        ('Dupatta', 'Dupatta'),
        ('Blouses', 'Blouses'),
        ('Kurti', 'Kurti'),
        ('Choli', 'Choli'),
        ('Kurta Sets', 'Kurta Sets'),
    ])
    image = models.ImageField(upload_to="product_images/", null=True, blank=True)
    def __str__(self):
        return self.name

class DesignRequest(models.Model):
    DesignRequestID = models.AutoField(primary_key=True, db_column="DesignRequestID")
    CustomerId = models.ForeignKey(Customer, on_delete=models.CASCADE, db_column="CustomerId")
    RequestDate = models.DateField(db_column="RequestDate")
    Status = models.CharField(
        max_length=20, 
        choices=[('Submitted', 'Submitted'), ('Approved', 'Approved'), ('Rejected', 'Rejected')],
        db_column="Status"
    )
    Details = models.TextField(null=True, blank=True, db_column="Details")

    class Meta:
        db_table = "designrequest"

class CustomDesign(models.Model):
    CustomDesignID = models.AutoField(primary_key=True, db_column="CustomDesignID")  
    DesignRequestID = models.IntegerField(db_column="DesignRequestID")  
    Description = models.TextField(null=True, blank=True,db_column="Description")  
    ImageURL = models.CharField(max_length=200, db_column="ImageURL")  
    Status = models.CharField(
        max_length=20,
        choices=[('Pending', 'Pending'), ('Approved', 'Approved'), ('Completed', 'Completed')],
        default='Pending',
        db_column="Status"
    )     
    class Meta:
        db_table = "customdesign"

class Payment(models.Model):
    payment_id = models.AutoField(db_column="PaymentID", primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, db_column="OrderID")
    payment_date = models.DateField(db_column="PaymentDate")
    amount = models.DecimalField(db_column="Amount", max_digits=10, decimal_places=2)
    payment_method = models.CharField(
        db_column="PaymentMethod",
        max_length=20,
        choices=[
            ('Credit Card', 'Credit Card'),
            ('Debit Card', 'Debit Card'),
            ('Net Banking', 'Net Banking'),
            ('Wallet', 'Wallet')
        ]
    )
    status = models.CharField(
        db_column="Status",
        max_length=20,
        choices=[
            ('Paid', 'Paid'),
            ('Unpaid', 'Unpaid'),
            ('Refund', 'Refund')
        ]
    )

    class Meta:
        db_table = "Payment"  # Make sure the table name is exactly as in MySQL

class DesignSubmission(models.Model):
    submission_id = models.AutoField(primary_key=True)
    design_request = models.ForeignKey(DesignRequest, on_delete=models.CASCADE)
    tailor = models.ForeignKey(Tailor, on_delete=models.CASCADE)
    submission_date = models.DateField()
    status = models.CharField(max_length=20, choices=[('Pending', 'Pending'), ('Approved', 'Approved'), ('Rejected', 'Rejected')])

class Wishlist(models.Model):
    wishlist_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Customer, to_field="CustomerId", on_delete=models.CASCADE, db_column="user_id")
    product = models.ForeignKey(Product, to_field="product_id", on_delete=models.CASCADE, db_column="product_id")
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "wishlist" 
    image = models.ImageField(upload_to="wishlist_images/", null=True, blank=True)
    def __str__(self):
        return f"{self.user.name} - {self.product.name}"

class Feedback(models.Model):
    feedback_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    tailor = models.ForeignKey(Tailor, on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.IntegerField(default=5)  # 1-5 stars
    comments = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class SelectedDesign(models.Model):
    selected_design_id = models.AutoField(primary_key=True, db_column="SelectedDesignID")
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, db_column="CustomerId")
    custom_design = models.ForeignKey(CustomDesign, on_delete=models.CASCADE, db_column="CustomDesignID")
    order = models.ForeignKey(Order, on_delete=models.CASCADE, db_column="OrderID")
    selection_date = models.DateField(db_column="SelectionDate")
    status = models.CharField(
        max_length=20,
        choices=[('Selected', 'Selected'), ('Approved', 'Approved'), ('Rejected', 'Rejected')],
        db_column="Status"
    )
    comments = models.TextField(null=True, blank=True, db_column="Comments")

    class Meta:
        db_table = "selecteddesign"  # Ensure Django maps this model to the correct table

class Cart(models.Model):
    cart_id = models.AutoField(primary_key=True)
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "myecommerce_cart"

    def __str__(self):
        return f"Cart of {self.customer.name}"

class CartItem(models.Model):
    cart_item_id = models.AutoField(primary_key=True)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    product_image = models.ImageField(upload_to='cart_images/', blank=True, null=True) 
 
    class Meta:
        db_table = "myecommerce_cartitem"
        
    def save(self, *args, **kwargs):
        """ Automatically set product image if not provided """
        if not self.product_image and self.product.image:
            self.product_image = self.product.image
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in {self.cart.customer.name}'s cart"

    def total_price(self):
        return self.product.price * self.quantity