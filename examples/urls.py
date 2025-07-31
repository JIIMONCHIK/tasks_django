# from django.urls import path
#
# from . import views
#
# urlpatterns = [
#     path("articles/2003/", views.special_case_2003),
#     path("articles/<int:year>/", views.year_archive),
#     path("articles/<int:year>/<int:month>/", views.month_archive),
#     path("articles/<int:year>/<int:month>/<slug:slug>/", views.article_detail),
# ]

# A request to /articles/2005/03/ would match the third entry in the list.
# Django would call the function views.month_archive(request, year=2005, month=3).


from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
]