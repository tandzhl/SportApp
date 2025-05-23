# Generated by Django 5.2 on 2025-05-24 03:13

import ckeditor.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sports', '0009_merge_20250524_1010'),
    ]

    operations = [
        # migrations.RemoveField(
        #     model_name='sportclass',
        #     name='decription',
        # ),
        migrations.AlterField(
            model_name='sportclass',
            name='description',
            field=ckeditor.fields.RichTextField(),
        ),
        migrations.AlterField(
            model_name='sportclass',
            name='name',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(choices=[('admin', 'Admin'), ('member', 'Member'), ('coach', 'Coach'), ('employee', 'Employee')], default='member', max_length=10),
        ),
    ]
