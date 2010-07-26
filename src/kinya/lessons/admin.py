from django.contrib import admin
from .models import Lesson, Question

class QuestionInline(admin.StackedInline):
    model = Question
    extra = 0

class QuestionAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'question', 'answer', 'note')
    list_editable = ('question', 'answer', 'note')
    list_filter = ('lesson', )
    search_fields = ('question', 'answer')
    actions_on_bottom = True
    actions_on_top = False
    
class LessonAdmin(admin.ModelAdmin):
    list_display = ('number', 'name')
    list_display_links = ('name', )
    search_fields = ('name',)
    ordering = ('number',)
    actions_on_bottom = True
    actions_on_top = False
    
    inlines = (QuestionInline, )
    
admin.site.register(Lesson, LessonAdmin)
admin.site.register(Question, QuestionAdmin)

