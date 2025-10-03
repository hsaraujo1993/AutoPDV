"""
URL configuration for app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from app import api_urls
from app.views import (
    FornecedoresView, ClientesView, CategoriasView, ProdutosView,
    EstoqueView, PrecosView, CarrinhoView, OrdersView, HomeView,
    CarrinhoItensView, OrderDetailView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include((api_urls, 'api'), namespace='v1')),

    path('home/', HomeView.as_view(), name='home'),
    path('fornecedores/', FornecedoresView.as_view(), name='fornecedores'),
    path('clientes/', ClientesView.as_view(), name='clientes'),
    path('categorias/', CategoriasView.as_view(), name='categorias'),
    path('produtos/', ProdutosView.as_view(), name='produtos'),
    path('estoque/', EstoqueView.as_view(), name='estoque'),
    path('precos/', PrecosView.as_view(), name='precos'),
    path('carrinho/', CarrinhoView.as_view(), name='carrinho'),
    path('orders/', OrdersView.as_view(), name='orders'),
    path('orders/<uuid:pk>/detail/', OrderDetailView.as_view(), name='order-detail'),
    path('cart_items/', include('cart_items.urls')),
    path('carrinho/itens/<uuid:cart_id>/', CarrinhoItensView.as_view(), name='carrinho-itens'),
]
