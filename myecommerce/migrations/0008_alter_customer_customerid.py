# Generated by Django 5.1.2 on 2025-03-21 03:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myecommerce', '0007_alter_customer_customer_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customer',
            name='CustomerId',
            field=models.AutoField(db_column='CustomerId', default=1, primary_key=True, serialize=False),
        ),
    ]
