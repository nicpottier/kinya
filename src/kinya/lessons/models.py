from django.db import models
from django.contrib.auth.models import User

class Lesson(models.Model):
    name = models.CharField(max_length=64)
    lesson = models.TextField()
    slug = models.SlugField()
    number = models.IntegerField()
    owner = models.ForeignKey(User)
    created = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)
    
    def __unicode__(self):
        return self.name

class Question(models.Model):
    lesson = models.ForeignKey(Lesson)
    question = models.CharField(max_length=255)
    answer = models.CharField(max_length=255)
    truth = models.CharField(max_length=255)
    note = models.CharField(max_length=255, null=True, blank=True)
    audio = models.FileField(upload_to="audio", null=True, blank=True)

    def __unicode__(self):
        return "%s - %s" % (self.question, self.answer)
    
class Attendance(models.Model):
    user = models.ForeignKey(User)
    lesson = models.ForeignKey(Lesson)
    active = models.BooleanField(default=True)
    started = models.DateTimeField(auto_now=True)
    
    def __unicode__(self):
        return "%s - %s" % (self.lesson.name, self.started)
    
class Record(models.Model):
    user = models.ForeignKey(User)
    question = models.ForeignKey(Question)
    right = models.IntegerField(default=0)
    wrong = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    last = models.DateTimeField(auto_now=True)
    
    def __unicode__(self):
        return "%s - +%d -%d" % (self.question.question, self.right, self.wrong)
