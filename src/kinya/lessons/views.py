from django.shortcuts import render_to_response
from .models import Lesson, Question

def lessons(request):
    lessons = Lesson.objects.filter(active=True).order_by('number')
    return render_to_response('lessons/lessons.html', { 'lessons': lessons })

def quiz(request):
    return render_to_response('lessons/quiz.html');

def ajax_lessons(request):
    lessons = Lesson.objects.filter(active=True).order_by('number')
    return render_to_response('lessons/ajax_lessons.html', { 'lessons': lessons })
