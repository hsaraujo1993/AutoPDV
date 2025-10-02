from django.shortcuts import render
from django.views.generic import TemplateView
from carts.models import Cart
from cart_items.models import CartItem
from django.shortcuts import get_object_or_404
from django.views import View

class FornecedoresView(TemplateView):
    template_name = 'fornecedores/list.html'

class ClientesView(TemplateView):
    template_name = 'clientes/list.html'

class CategoriasView(TemplateView):
    template_name = 'categorias/list.html'

class ProdutosView(TemplateView):
    template_name = 'produtos/list.html'

class EstoqueView(TemplateView):
    template_name = 'estoque/list.html'

class PrecosView(TemplateView):
    template_name = 'precos/list.html'

class CarrinhoView(TemplateView):
    template_name = 'carrinho/cart.html'

class OrdersView(TemplateView):
    template_name = 'orders/list.html'

class HomeView(TemplateView):
    template_name = 'home/home.html'

class CarrinhoItensView(View):
    def get(self, request, cart_id):
        cart = get_object_or_404(Cart, id=cart_id)
        itens = CartItem.objects.filter(cart=cart)
        return render(request, 'carrinho/cart_detail.html', {
            'cart': cart,
            'cart_id': cart_id,
            'itens': itens,
        })
