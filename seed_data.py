import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from categories.models import Category
from products.models import Product
from prices.models import Price
from stocks.models import Stock
from customers.models import Customer

# Apaga todos os dados existentes na ordem correta
Stock.objects.all().delete()
Price.objects.all().delete()
Product.objects.all().delete()
Category.objects.all().delete()
Customer.objects.all().delete()

# Categories
cat1 = Category.objects.create(name='Auto Parts', description='Car auto parts')
cat2 = Category.objects.create(name='Accessories', description='Car accessories')
cat3 = Category.objects.create(name='Tools', description='Workshop tools')
cat4 = Category.objects.create(name='Lubricants', description='Engine lubricants')
cat5 = Category.objects.create(name='Electronics', description='Car electronics')
cat6 = Category.objects.create(name='Suspension', description='Suspension parts')
cat7 = Category.objects.create(name='Brakes', description='Brake system')
cat8 = Category.objects.create(name='Lighting', description='Lighting and lamps')
cat9 = Category.objects.create(name='Interior', description='Interior accessories')
cat10 = Category.objects.create(name='Exterior', description='Exterior accessories')

# Customers
cust1 = Customer.objects.create(name='João Silva', type='cliente_final', email='joao@email.com', phone='11999999999', address='Rua A, 123')
cust2 = Customer.objects.create(name='Maria Souza', type='cliente_vip', email='maria@email.com', phone='11888888888', address='Rua B, 456')
cust3 = Customer.objects.create(name='Oficina Mecânica', type='mecanico', email='oficina@email.com', phone='11777777777', address='Rua C, 789')
cust4 = Customer.objects.create(name='Carlos Lima', type='varejo', email='carlos@email.com', phone='11666666666', address='Rua D, 321')
cust5 = Customer.objects.create(name='Auto Center', type='mecanico', email='autocenter@email.com', phone='11555555555', address='Rua E, 654')
cust6 = Customer.objects.create(name='Julia Ramos', type='cliente_final', email='julia@email.com', phone='11444444444', address='Rua F, 987')
cust7 = Customer.objects.create(name='Mecânica do Zé', type='mecanico', email='ze@email.com', phone='11333333333', address='Rua G, 741')
cust8 = Customer.objects.create(name='Pedro Alves', type='cliente_vip', email='pedro@email.com', phone='11222222222', address='Rua H, 852')
cust9 = Customer.objects.create(name='Loja Peças', type='varejo', email='pecas@email.com', phone='11111111111', address='Rua I, 963')
cust10 = Customer.objects.create(name='Mecânica Express', type='mecanico', email='express@email.com', phone='11000000000', address='Rua J, 159')

# Products
produtos = [
    {'name': 'Filtro de Óleo', 'sku': 'FILTRO001', 'category': cat1, 'status': 1},
    {'name': 'Tapete Automotivo', 'sku': 'TAPETE001', 'category': cat2, 'status': 1},
    {'name': 'Chave de Roda', 'sku': 'CHAVE001', 'category': cat3, 'status': 1},
    {'name': 'Óleo Sintético 5W30', 'sku': 'OLEO001', 'category': cat4, 'status': 1},
    {'name': 'Central Multimídia', 'sku': 'MULTIMIDIA001', 'category': cat5, 'status': 1},
    {'name': 'Pastilha de Freio', 'sku': 'PASTILHA001', 'category': cat7, 'status': 1},
    {'name': 'Cera Automotiva', 'sku': 'CERA001', 'category': cat9, 'status': 1},
    {'name': 'Lanterna Traseira', 'sku': 'LANTERNA001', 'category': cat8, 'status': 1},
    {'name': 'Chave de Fenda', 'sku': 'CHAVEFENDA001', 'category': cat3, 'status': 1},
    {'name': 'Óleo Mineral 20W50', 'sku': 'OLEO002', 'category': cat4, 'status': 1},
    {'name': 'Amortecedor Dianteiro', 'sku': 'AMORT001', 'category': cat6, 'status': 1},
    {'name': 'Disco de Freio', 'sku': 'DISCOFREIO001', 'category': cat7, 'status': 1},
    {'name': 'Lampada LED', 'sku': 'LED001', 'category': cat8, 'status': 1},
    {'name': 'Volante Esportivo', 'sku': 'VOLANTE001', 'category': cat9, 'status': 1},
    {'name': 'Calota Aro 14', 'sku': 'CALOTA001', 'category': cat10, 'status': 1},
    {'name': 'Sensor de Estacionamento', 'sku': 'SENSOR001', 'category': cat5, 'status': 1},
    {'name': 'Bomba de Combustível', 'sku': 'BOMBA001', 'category': cat1, 'status': 1},
    {'name': 'Jogo de Tapetes Luxo', 'sku': 'TAPETELUXO001', 'category': cat2, 'status': 1},
    {'name': 'Kit Ferramentas', 'sku': 'KITFERR001', 'category': cat3, 'status': 1},
    {'name': 'Óleo de Câmbio', 'sku': 'OLEOCAMBIO001', 'category': cat4, 'status': 1},
]

prod_objs = []
for i, prod in enumerate(produtos):
    p = Product.objects.create(**prod)
    prod_objs.append(p)
    # Price
    Price.objects.create(product=p,
        purchase_price_without_tax=10.0 + i*5,
        purchase_price_with_tax=11.0 + i*5,
        sale_price=20.0 + i*10,
        profit_margin=10.0 + i*5)
    # Stock
    Stock.objects.create(product=p,
        quantity=50 + i*10,
        min_quantity=5 + i,
        max_quantity=100 + i*10,
        location=f'Estoque {chr(65 + (i % 5))}')

print('Base de dados resetada e populada com muitos itens fictícios!')
