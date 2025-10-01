from django.shortcuts import render
from django.db.models.deletion import ProtectedError
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework import status

from categories.models import Category
from categories.serializers import CategorySerializer


# Create your views here.


class CategoryListCreateView(ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CategoryRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'category_id'

    def delete(self, request, *args, **kwargs):
        try:
            return super().delete(request, *args, **kwargs)
        except ProtectedError:
            return Response({
                'detail': 'Não é possível excluir esta categoria porque ela está vinculada a produtos.'
            }, status=status.HTTP_400_BAD_REQUEST)
