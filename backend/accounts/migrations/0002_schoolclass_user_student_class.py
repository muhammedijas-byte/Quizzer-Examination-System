import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SchoolClass',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('teacher', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='classes', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['name', 'id']},
        ),
        migrations.AddConstraint(
            model_name='schoolclass',
            constraint=models.UniqueConstraint(fields=('teacher', 'name'), name='unique_class_name_per_teacher'),
        ),
        migrations.AddField(
            model_name='user',
            name='student_class',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='students', to='accounts.schoolclass'),
        ),
    ]
