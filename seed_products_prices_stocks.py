import requests

API_BASE = 'http://127.0.0.1:8000/api/v1/'

# Adapte se precisar autenticação
HEADERS = {
    'Content-Type': 'application/json',
}

def get_all(endpoint):
    results = []
    url = f'{API_BASE}{endpoint}/'
    while url:
        resp = requests.get(url, headers=HEADERS)
        resp.raise_for_status()
        data = resp.json()
        results.extend(data.get('results', data))
        url = data.get('next')
    return results

def post(endpoint, payload):
    url = f'{API_BASE}{endpoint}/'
    resp = requests.post(url, json=payload, headers=HEADERS)
    resp.raise_for_status()
    return resp.json()

def create_product(payload):
    # Remove campos None do payload
    clean_payload = {k: v for k, v in payload.items() if v is not None}
    url = f'{API_BASE}products/'
    resp = requests.post(url, json=clean_payload, headers=HEADERS)
    resp.raise_for_status()
    return resp.json()

def create_category(name):
    url = f'{API_BASE}categories/'
    payload = {'name': name}
    resp = requests.post(url, json=payload, headers=HEADERS)
    resp.raise_for_status()
    return resp.json()

# Exemplo de produtos para inserir
NEW_PRODUCTS = [
    {
        'name': f'Produto Teste {i+1}',
        'sku': f'TESTE{i+1:03d}',
        'oem_code': f'OEM{i+1:03d}',
        'oem_alternative_code': f'ALT{i+1:03d}',
        'status': 1,
        'category': None,
        'supplier': None,
        'description': f'Produto de teste número {i+1}.'
    }
    for i in range(25)
]

CATEGORY_NAME = 'Categoria Padrão'

def main():
    # Cria categoria padrão se não existir
    categories = get_all('categories')
    cat = next((c for c in categories if c['name'] == CATEGORY_NAME), None)
    if not cat:
        cat = create_category(CATEGORY_NAME)
        print(f'Categoria criada: {cat["name"]} - ID: {cat["id"]}')
    category_id = cat['id']

    # Insere novos produtos
    for prod in NEW_PRODUCTS:
        prod['category'] = category_id
        created = create_product(prod)
        prod_id = created['id']
        print(f'Produto criado: {prod["name"]} - ID: {prod_id}')
        # Insere preço
        price_payload = {
            'product': prod_id,
            'purchase_price_without_tax': 100.0,
            'purchase_price_with_tax': 110.0,
            'sale_price': 150.0,
            'profit_margin': 10.0
        }
        post('prices', price_payload)
        print(f'Preço criado para produto {prod_id}')
        # Insere estoque
        stock_payload = {
            'product': prod_id,
            'quantity': 10,
            'min_quantity': 2,
            'max_quantity': 100,
            'location': 'Depósito A'
        }
        post('stocks', stock_payload)
        print(f'Estoque criado para produto {prod_id}')

    products = get_all('products')
    prices = get_all('prices')
    stocks = get_all('stocks')

    price_product_ids = {p['product'] for p in prices if 'product' in p}
    stock_product_ids = {s['product'] for s in stocks if 'product' in s}

    for prod in products:
        prod_id = prod['id']
        # Adiciona preço se não existir
        if prod_id not in price_product_ids:
            price_payload = {
                'product': prod_id,
                'purchase_price_without_tax': 100.0,
                'purchase_price_with_tax': 110.0,
                'sale_price': 150.0,
                'profit_margin': 10.0
            }
            post('prices', price_payload)
            print(f'Preço criado para produto {prod_id}')
        # Adiciona estoque se não existir
        if prod_id not in stock_product_ids:
            stock_payload = {
                'product': prod_id,
                'quantity': 10,
                'min_quantity': 2,
                'max_quantity': 100,
                'location': 'Depósito A'
            }
            post('stocks', stock_payload)
            print(f'Estoque criado para produto {prod_id}')

if __name__ == '__main__':
    main()
