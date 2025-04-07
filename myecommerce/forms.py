from django import forms
from .models import Tailor

class TailorForm(forms.ModelForm):
    class Meta:
        model = Tailor
        fields = ["name", "email", "password", "specialization"]
