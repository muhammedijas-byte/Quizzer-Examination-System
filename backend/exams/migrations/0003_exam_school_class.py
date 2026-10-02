import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0002_schoolclass_user_student_class'),
        ('exams', '0002_question'),
    ]

    operations = [
        migrations.AddField(
            model_name='exam',
            name='school_class',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='exams', to='accounts.schoolclass'),
        ),
    ]
