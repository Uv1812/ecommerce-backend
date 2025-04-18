# Generated by Django 5.1.2 on 2025-03-24 13:09

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myecommerce', '0014_alter_selecteddesign_table'),
    ]

    operations = [
        migrations.AlterField(
            model_name='selecteddesign',
            name='comments',
            field=models.TextField(blank=True, db_column='Comments', null=True),
        ),
        migrations.AlterField(
            model_name='selecteddesign',
            name='custom_design',
            field=models.ForeignKey(db_column='CustomDesignID', on_delete=django.db.models.deletion.CASCADE, to='myecommerce.customdesign'),
        ),
        migrations.AlterField(
            model_name='selecteddesign',
            name='customer',
            field=models.ForeignKey(db_column='CustomerId', on_delete=django.db.models.deletion.CASCADE, to='myecommerce.customer'),
        ),
        migrations.AlterField(
            model_name='selecteddesign',
            name='order',
            field=models.ForeignKey(db_column='OrderID', on_delete=django.db.models.deletion.CASCADE, to='myecommerce.order'),
        ),
        migrations.AlterField(
            model_name='selecteddesign',
            name='selected_design_id',
            field=models.AutoField(db_column='SelectedDesignID', primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='selecteddesign',
            name='selection_date',
            field=models.DateField(db_column='SelectionDate'),
        ),
        migrations.AlterField(
            model_name='selecteddesign',
            name='status',
            field=models.CharField(choices=[('Selected', 'Selected'), ('Approved', 'Approved'), ('Rejected', 'Rejected')], db_column='Status', max_length=20),
        ),
    ]
