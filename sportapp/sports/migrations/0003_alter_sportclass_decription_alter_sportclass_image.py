# Generated by Django 5.1.7 on 2025-04-29 20:10

import ckeditor.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sports', '0002_sportclass_image_user_avatar_alter_user_role_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sportclass',
            name='description',
            field=ckeditor.fields.RichTextField(),
        ),
        migrations.AlterField(
            model_name='sportclass',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='sportclass/%Y/%m'),
        ),
    ]
