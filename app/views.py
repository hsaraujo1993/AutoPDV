from django.shortcuts import render
from django.views.generic import TemplateView

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

def cart_detail(request, cart_id):
    """
    Renderiza a página de detalhes de um carrinho específico.
    O cart_id é passado do URL para o template.
    """
    return render(request, 'carrinho/cart_detail.html', {'cart_id': cart_id})