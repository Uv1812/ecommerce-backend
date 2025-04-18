# Generated by Django 5.1.2 on 2025-03-31 07:16

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myecommerce', '0027_alter_customer_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='customer',
            name='address',
            field=models.CharField(db_column='Address', max_length=100),
        ),
        migrations.AlterField(
            model_name='customer',
            name='email',
            field=models.EmailField(db_column='Email', default='ur2@gmail.com', max_length=254, unique=True),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='customer',
            name='name',
            field=models.CharField(db_column='Name', default='Kokila', max_length=50),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='customer',
            name='password',
            field=models.CharField(db_column='Password', default='1234', max_length=50),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='customer',
            name='user',
            field=models.OneToOneField(db_column='user_id', on_delete=django.db.models.deletion.CASCADE, related_name='customer', to=settings.AUTH_USER_MODEL),
        ),
    ]
