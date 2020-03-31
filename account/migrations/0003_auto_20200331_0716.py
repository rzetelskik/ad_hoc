# Generated by Django 3.0.4 on 2020-03-31 07:16

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0002_customuser_location_range'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='location_range',
            field=models.IntegerField(default=3, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(50)], verbose_name='location_range'),
        ),
    ]
