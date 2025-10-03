from django.shortcuts import render
from django.views.generic import TemplateView
from carts.models import Cart
from cart_items.models import CartItem
from django.shortcuts import get_object_or_404
from django.views import View
from orders.models import Order
from order_items.models import OrderItem

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

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Indicadores
        context['total_pedidos'] = 2
        context['total_vendas'] = '9200.00'
        context['total_clientes'] = 2
        context['total_estoque_baixo'] = 2
        # Dados para gráficos
        produtos_mais_vendidos = [
            {'nome': 'Teclado Gamer', 'vendas': 120},
            {'nome': 'Mouse Sem Fio', 'vendas': 95},
        ]
        context['produtos_mais_vendidos_labels'] = [p['nome'] for p in produtos_mais_vendidos]
        context['produtos_mais_vendidos_data'] = [p['vendas'] for p in produtos_mais_vendidos]
        pedidos_status = [
            {'status': 'Aprovado', 'qtd': 1},
            {'status': 'Pendente', 'qtd': 1},
            {'status': 'Cancelado', 'qtd': 0},
        ]
        context['pedidos_status_labels'] = [p['status'] for p in pedidos_status]
        context['pedidos_status_data'] = [p['qtd'] for p in pedidos_status]
        return context

class CarrinhoItensView(View):
    def get(self, request, cart_id):
        cart = get_object_or_404(Cart, id=cart_id)
        itens = CartItem.objects.filter(cart=cart)
        return render(request, 'carrinho/cart_detail.html', {
            'cart': cart,
            'cart_id': cart_id,
            'itens': itens,
        })

class OrderDetailView(View):
    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        items = OrderItem.objects.filter(order_id=order.id)
        return render(request, 'orders/detail.html', {
            'order': order,
            'items': items
        })
