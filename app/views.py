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