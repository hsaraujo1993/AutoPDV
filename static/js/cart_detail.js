// Configurações da API
const API_CART_URL = '/api/v1/carts/';
const API_PRODUCTS_URL = '/api/v1/products/';
const API_PRICES_URL = '/api/v1/prices/';

// Elementos do DOM
const messagesDiv = document.getElementById('messages');
const formContainer = document.getElementById('form-container');
const tableBody = document.querySelector('.styled-table tbody');
const totalAmountDiv = document.querySelector('.total-amount');

// Obter o ID do carrinho da URL
const pathParts = window.location.pathname.split('/').filter(p => p);
const cartId = pathParts[2];

console.log('Path parts:', pathParts);
console.log('Cart ID:', cartId);

// Função para obter o CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Função para mostrar mensagens
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type}`;
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 5000);
}

// Função para ocultar o formulário
function hideForm() {
    formContainer.style.display = 'none';
    formContainer.innerHTML = '';
}

// Função para carregar itens do carrinho
async function fetchCartItems() {
    try {
        const url = `${API_CART_URL}${cartId}/`;
        console.log('Buscando carrinho:', url);

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Erro ${res.status}`);

        const cart = await res.json();
        console.log('Carrinho carregado:', cart);

        // Limpar tabela
        tableBody.innerHTML = '';

        let total = 0;

        // Preencher tabela com itens
        if (cart.items && cart.items.length > 0) {
            cart.items.forEach(item => {
                console.log('Processando item:', item); // Debug para ver o item

                const produto = item.product_name || 'Produto sem nome';
                const quantidade = Number(item.quantity) || 0;
                const preco = Number(item.unit_price) || 0;
                const subtotal = quantidade * preco;

                console.log('Valores processados:', { produto, quantidade, preco, subtotal }); // Debug

                // Adicionar subtotal ao total
                total += subtotal;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${produto}</td>
                    <td>${quantidade}</td>
                    <td>R$ ${preco.toFixed(2)}</td>
                    <td>R$ ${subtotal.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="removeItem(${item.id})">Remover</button>
                    </td>
                `;

                console.log('HTML da linha:', row.innerHTML); // Debug
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum item no carrinho</td></tr>';
        }

        // Atualizar total
        totalAmountDiv.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;

    } catch (err) {
        showMessage('Erro ao carregar itens do carrinho.', 'error');
        console.error("Erro ao carregar carrinho:", err);
    }
}

// Função para buscar preço de um produto específico
async function fetchProductPrice(productId) {
    try {
        const res = await fetch(`${API_PRICES_URL}?product=${productId}`);
        if (!res.ok) {
            console.warn(`Erro ao buscar preço do produto ${productId}`);
            return 0;
        }
        const prices = await res.json();
        if (Array.isArray(prices) && prices.length > 0) {
            return parseFloat(prices[0].sale_price || 0);
        }
        return parseFloat(prices.sale_price || 0);
    } catch (err) {
        console.error(`Erro ao buscar preço do produto ${productId}:`, err);
        return 0;
    }
}

// Função para mostrar formulário de adicionar item
async function showAddItemForm() {
    formContainer.style.display = 'block';
    formContainer.innerHTML = '<p>Carregando produtos...</p>';

    try {
        const productsRes = await fetch(API_PRODUCTS_URL);

        if (!productsRes.ok) {
            throw new Error("Erro ao carregar produtos.");
        }

        const products = await productsRes.json();
        console.log('Produtos carregados:', products);

        if (!products || products.length === 0) {
            formContainer.innerHTML = '<div class="alert alert-warning">Nenhum produto disponível.</div>';
            return;
        }

        const selectOptions = products.map(p => {
            return `<option value="${p.id}" data-stock="${p.stock_quantity}">${p.name} - Estoque: ${p.stock_quantity}</option>`;
        }).join('');

        formContainer.innerHTML = `
            <form id="add-item-form">
                <div>
                    <label for="product-select">Produto:</label>
                    <select name="product" id="product-select" required>
                        <option value="">Selecione um produto</option>
                        ${selectOptions}
                    </select>
                </div>
                <div id="price-info" style="font-weight: 600; color: #28a745; display: none;">
                    Preço: R$ <span id="product-price">0.00</span>
                </div>
                <div>
                    <label for="quantity-input">Quantidade:</label>
                    <input type="number" name="quantity" id="quantity-input" placeholder="Quantidade" required min="1" max="1">
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button type="submit" class="btn btn-success create-btn">Adicionar</button>
                    <button type="button" class="btn btn-secondary" onclick="hideForm()">Cancelar</button>
                </div>
            </form>
        `;

        const productSelect = document.getElementById('product-select');
        const quantityInput = document.getElementById('quantity-input');
        const priceInfo = document.getElementById('price-info');
        const priceSpan = document.getElementById('product-price');

        productSelect.addEventListener('change', async function() {
            const selectedOption = this.options[this.selectedIndex];

            if (!this.value) {
                quantityInput.max = 1;
                priceInfo.style.display = 'none';
                return;
            }

            const stock = selectedOption.getAttribute('data-stock');
            quantityInput.max = stock;
            quantityInput.value = 1;

            priceInfo.style.display = 'block';
            priceSpan.textContent = 'Carregando...';

            const price = await fetchProductPrice(this.value);
            priceSpan.textContent = price.toFixed(2);
        });

        const form = document.getElementById('add-item-form');
        form.onsubmit = e => {
            e.preventDefault();
            const formData = new FormData(form);
            const productId = formData.get('product');
            const quantity = parseInt(formData.get('quantity'));

            if (!productId) {
                showMessage('Selecione um produto.', 'error');
                return;
            }

            addItem(productId, quantity);
        };
    } catch (err) {
        formContainer.innerHTML = `<div class="alert alert-error">Erro ao carregar produtos: ${err.message}</div>`;
        console.error("Erro ao carregar formulário:", err);
    }
}

// Função para adicionar item ao carrinho
async function addItem(productId, quantity) {
    try {
        const url = `${API_CART_URL}${cartId}/add-item/`;
        console.log('Adicionando item:', { url, productId, quantity });

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error('Erro ao adicionar item:', errorData);
            throw new Error(`Erro ${res.status}: ${errorData.detail || 'Erro ao adicionar item'}`);
        }

        showMessage('Item adicionado com sucesso!', 'success');
        hideForm();
        fetchCartItems();
    } catch (err) {
        showMessage(err.message || 'Erro ao adicionar item.', 'error');
        console.error("Erro ao adicionar item:", err);
    }
}

// Função para remover item do carrinho
async function removeItem(itemId) {
    if (!confirm('Deseja realmente remover este item?')) return;

    try {
        const url = `${API_CART_URL}${cartId}/remove-item/${itemId}/`;
        console.log('Removendo item:', url);

        const res = await fetch(url, {
            method: 'POST', // Corrigido para POST
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        if (!res.ok) throw new Error(`Erro ${res.status}`);

        showMessage('Item removido com sucesso!', 'success');
        fetchCartItems();
    } catch (err) {
        showMessage('Erro ao remover item.', 'error');
        console.error("Erro ao remover item:", err);
    }
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    if (!cartId || cartId === 'itens') {
        showMessage('ID do carrinho inválido na URL.', 'error');
        console.error('Cart ID inválido:', cartId);
        return;
    }

    const tableBody = document.querySelector('.styled-table tbody');
    if (!tableBody) {
        console.error('Elemento tbody não encontrado!');
        return;
    }
    console.log('Elemento tbody encontrado:', tableBody);

    fetchCartItems();

    const addItemBtn = document.getElementById('add-item-btn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', showAddItemForm);
    }

    const finalizeBtn = document.getElementById('finalize-cart-btn');
    if (finalizeBtn) {
        finalizeBtn.addEventListener('click', async () => {
            if (!confirm('Deseja finalizar este pedido?')) return;

            try {
                const url = `${API_CART_URL}${cartId}/finalize/`;
                console.log('Finalizando pedido:', url);

                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                });

                if (!res.ok) throw new Error(`Erro ${res.status}`);

                showMessage('Pedido finalizado com sucesso!', 'success');
                fetchCartItems();
            } catch(err) {
                showMessage('Erro ao finalizar pedido.', 'error');
                console.error("Erro ao finalizar pedido:", err);
            }
        });
    }
});

// Tornar funções globais para onclick
window.hideForm = hideForm;
window.removeItem = removeItem;