from django.conf.urls.defaults import *
import lessons.views
import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Example:
    #(r'^kinya/', include('kinya.foo.urls')),

    # Uncomment the admin/doc line below and add 'django.contrib.admindocs' 
    # to INSTALLED_APPS to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
     (r'^admin/', include(admin.site.urls)),
     
     # our lessons
     (r'^$', lessons.views.quiz),

     # ajax call for lessons
     (r'^ajax/get_lessons$', lessons.views.ajax_lessons),

     # static files
     (r'^static/(?P<path>.*)$', 'django.views.static.serve',
      {'document_root': settings.MEDIA_ROOT}),
)
