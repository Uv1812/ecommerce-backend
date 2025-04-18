# Generated by Django 5.1.2 on 2025-03-24 09:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myecommerce', '0008_alter_customer_customerid'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customdesign',
            name='custom_design_id',
        ),
        migrations.RemoveField(
            model_name='customdesign',
            name='description',
        ),
        migrations.RemoveField(
            model_name='customdesign',
            name='design_request',
        ),
        migrations.RemoveField(
            model_name='customdesign',
            name='image_url',
        ),
        migrations.RemoveField(
            model_name='customdesign',
            name='status',
        ),
        migrations.AddField(
            model_name='customdesign',
            name='CustomDesignID',
            field=models.AutoField(db_column='CustomDesignID', default=1, primary_key=True, serialize=False),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='customdesign',
            name='DesignRequestID',
            field=models.IntegerField(db_column='DesignRequestID', default=1),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='customdesign',
            name='ImageURL',
            field=models.CharField(db_column='ImageURL', default='p1.png', max_length=200),
            preserve_default=False,
        ),
        migrations.AlterModelTable(
            name='customdesign',
            table='customdesign',
        ),
        migrations.AlterModelTable(
            name='designrequest',
            table='designrequest',
        ),
        migrations.AddField(
            model_name='customdesign',
            name='Description',
            field=models.TextField(blank=True, db_column='Description', null=True),
        ),
        migrations.AddField(
            model_name='customdesign',
            name='Status',
            field=models.CharField(choices=[('Pending', 'Pending'), ('Approved', 'Approved'), ('Completed', 'Completed')], db_column='Status', default='Pending', max_length=20),
        ),
    ]
