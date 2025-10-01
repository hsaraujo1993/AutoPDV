// carrinho.js
const API_CART_URL = '/api/v1/carts/';
const API_CARTITEM_URL = '/api/v1/cart-items/';
const API_PRODUCTS_URL = '/api/v1/products/';
const API_CUSTOMERS_URL = '/api/v1/customers/';

let currentCartId = null;

// DOM elements
const cartContainer = document.getElementById('cart-container');
const formContainer = document.getElementById('form-container');
const messagesDiv = document.getElementById('messages');

// ======= UTILIDADES =======
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showMessage(msg, type = 'success', timeout = 3000) {
    messagesDiv.innerHTML = `<div class="${type}">${msg}</div>`;
    setTimeout(() => messagesDiv.innerHTML = '', timeout);
}

function calculateTotal(items) {
    return items.reduce((sum, i) => sum + i.quantity * parseFloat(i.unit_price), 0);
}

// ======= CART FUNCTIONS =======
async function fetchCartItems() {
    if (!currentCartId) return;
    try {
        const res = await fetch(`${API_CART_URL}${currentCartId}/items/`);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const items = await res.json();
        renderCart(items);
    } catch {
        showMessage('Erro ao carregar itens do carrinho.', 'error');
    }
}

async function finalizeCart() {
    if (!currentCartId) return;
    const csrftoken = getCookie('csrftoken');
    try {
        const res = await fetch(`${API_CART_URL}${currentCartId}/finalize/`, {
            method: 'POST',
            headers: { 'X-CSRFToken': csrftoken },
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        showMessage('Pedido finalizado!', 'success');
        cartContainer.innerHTML = '';
        currentCartId = null;
    } catch {
        showMessage('Erro ao finalizar pedido.', 'error');
    }
}

// ======= CART ITEM FUNCTIONS =======
async function addItem(productId, quantity) {
    if (!currentCartId || !productId || quantity <= 0) return showMessage('Dados inválidos.', 'error');
    const csrftoken = getCookie('csrftoken');
    try {
        const res = await fetch(API_CARTITEM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({ cart: currentCartId, product: productId, quantity })
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        hideForm();
        fetchCartItems();
        showMessage('Item adicionado ao carrinho!', 'success');
    } catch {
        showMessage('Erro ao adicionar item.', 'error');
    }
}

async function deleteItem(id) {
    if (!id) return;
    const csrftoken = getCookie('csrftoken');
    try {
        const res = await fetch(`${API_CARTITEM_URL}${id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrftoken,
            },
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        fetchCartItems();
        showMessage('Item excluído!', 'success');
    } catch {
        showMessage('Erro ao excluir item.', 'error');
    }
}

// ======= RENDER =======
function renderCart(items) {
    if (!items) items = [];
    const total = calculateTotal(items);

    const htmlRows = items.map(i => `
        <tr>
            <td>${i.product_name ? i.product_name : '-'}</td>
            <td>${i.quantity != null ? i.quantity : '-'}</td>
            <td>${i.unit_price != null ? parseFloat(i.unit_price).toFixed(2) : '-'}</td>
            <td>${(i.quantity != null && i.unit_price != null) ? (i.quantity * parseFloat(i.unit_price)).toFixed(2) : '-'}</td>
            <td style="text-align:center;">
                <button class="btn edit" onclick="editCarrinho('${i.id}')" title="Editar Item">
                    <svg width='16' height='16' fill='none' viewBox='0 0 24 24' style='vertical-align:middle;margin-right:2px;'><path stroke='currentColor' stroke-width='2' d='M16.5 5.5l2 2a2 2 0 010 2.83l-8.5 8.5a2 2 0 01-1.41.59H5v-3.09a2 2 0 01.59-1.41l8.5-8.5a2 2 0 012.91 0z'/></svg>
                    Editar
                </button>
                <button class="btn delete" onclick="deleteCarrinho('${i.id}')" title="Excluir Item">
                    <svg width='16' height='16' fill='none' viewBox='0 0 24 24' style='vertical-align:middle;margin-right:2px;'><path stroke='currentColor' stroke-width='2' d='M6 7h12M9 7V5a3 3 0 016 0v2m-7 0h8m-9 2v10a2 2 0 002 2h6a2 2 0 002-2V9'/></svg>
                    Excluir
                </button>
            </td>
        </tr>
    `).join('');

    cartContainer.innerHTML = `
        <table class="styled-table">
            <thead>
                <tr><th>Produto</th><th>Quantidade</th><th>Preço Unitário</th><th>Subtotal</th><th>Ações</th></tr>
            </thead>
            <tbody>${htmlRows || `<tr><td colspan="5" style="text-align:center; padding:1rem;">Nenhum item no carrinho.</td></tr>`}</tbody>
        </table>
        <div style="margin-top:1rem;"><strong>Total: R$ ${total.toFixed(2)}</strong></div>
        <button class="btn create-btn" onclick="showAddItemForm()">Adicionar Item</button>
        <button class="btn finalize-btn" onclick="finalizeCart()">Finalizar Pedido</button>
    `;
}

function renderCarts(carts) {
    const tbody = document.querySelector('#cart-table tbody');
    tbody.innerHTML = '';
    if (!carts.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum carrinho encontrado.</td></tr>';
        return;
    }
    carts.forEach(cart => {
        tbody.innerHTML += `
            <tr>
                <td>${cart.id ? cart.id : '-'}</td>
                <td>${cart.status_cart ? cart.status_cart : '-'}</td>
                <td>${cart.created_at ? new Date(cart.created_at).toLocaleString() : '-'}</td>
                <td>${cart.updated_at ? new Date(cart.updated_at).toLocaleString() : '-'}</td>
                <td>${cart.customer ? cart.customer : '-'}</td>
                <td class="text-center">
                    <div style="display:flex; gap:8px; justify-content:center;">
                        <button class="btn view" title="Abrir Carrinho" onclick="openCart('${cart.id}')">
                            Abrir Carrinho
                        </button>
                        <button class="btn delete" title="Excluir Carrinho" onclick="deleteCart('${cart.id}')">
                            Excluir
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// ======= NOVA FUNÇÃO: Buscar e exibir todos os carrinhos =======
async function fetchCarts() {
    try {
        const res = await fetch(API_CART_URL);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const carts = await res.json();
        renderCarts(carts);
    } catch {
        showMessage('Erro ao carregar carrinhos.', 'error');
    }
}

// Chamar fetchCarts ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    fetchCarts();
    if (currentCartId) fetchCartItems();
});

window.addItemToCart = function(cartId) {
    currentCartId = cartId;
    showAddItemForm();
}

window.openCart = function(cartId) {
    currentCartId = cartId;
    fetchCartItems();
};

// ======= FORM FUNCTIONS =======
async function showAddItemForm() {
    formContainer.style.display = 'block';
    formContainer.innerHTML = `
        <form id="add-item-form">
            <select name="product" required></select>
            <input type="number" name="quantity" placeholder="Quantidade" required min="1">
            <button type="submit" class="btn create-btn">Adicionar</button>
            <button type="button" class="btn delete" onclick="hideForm()">Cancelar</button>
        </form>
    `;

    try {
        const res = await fetch(API_PRODUCTS_URL);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const products = await res.json();
        const select = formContainer.querySelector('select[name=product]');
        select.innerHTML = products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    } catch {
        showMessage('Erro ao carregar produtos.', 'error');
    }

    const form = document.getElementById('add-item-form');
    form.onsubmit = e => {
        e.preventDefault();
        const formData = new FormData(form);
        const productId = formData.get('product');
        const quantity = parseInt(formData.get('quantity'));
        addItem(productId, quantity);
    };
}

async function showCartForm() {
    formContainer.style.display = 'block';
    formContainer.innerHTML = `
        <form id="cart-form">
            <select name="customer" required></select>
            <button type="submit" class="btn create-btn">Criar Carrinho</button>
            <button type="button" class="btn delete" onclick="hideForm()">Cancelar</button>
        </form>
    `;
    // Preenche select de clientes
    try {
        const res = await fetch(API_CUSTOMERS_URL);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const customers = await res.json();
        const select = formContainer.querySelector('select[name=customer]');
        select.innerHTML = customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch {
        showMessage('Erro ao carregar clientes.', 'error');
    }
    const form = document.getElementById('cart-form');
    form.onsubmit = e => {
        e.preventDefault();
        createCartWithCustomer();
    };
}

async function createCartWithCustomer() {
    const form = document.getElementById('cart-form');
    const data = Object.fromEntries(new FormData(form));
    const csrftoken = getCookie('csrftoken');
    try {
        const res = await fetch(API_CART_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({ customer: data.customer })
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const cart = await res.json();
        currentCartId = cart.id;
        showMessage('Carrinho criado!', 'success');
        fetchCartItems();
        hideForm();
    } catch {
        showMessage('Erro ao criar carrinho.', 'error');
    }
}

function hideForm() {
    formContainer.style.display = 'none';
    formContainer.innerHTML = '';
}

window.showClienteForm = function() {
    formContainer.style.display = 'block';
    formContainer.innerHTML = `
        <form id='cliente-form'>
            <input type='text' name='name' placeholder='Nome' required>
            <input type='email' name='email' placeholder='Email' required>
            <input type='text' name='phone' placeholder='Telefone' required>
            <input type='text' name='address' placeholder='Endereço' required>
            <button type='submit' class='btn create-btn'>Salvar Cliente</button>
            <button type='button' class='btn cancel' onclick='hideForm()'>Cancelar</button>
        </form>
    `;
    const form = document.getElementById('cliente-form');
    form.onsubmit = async e => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        const csrftoken = getCookie('csrftoken');
        try {
            const res = await fetch(API_CUSTOMERS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`Erro ${res.status}`);
            showMessage('Cliente criado com sucesso!', 'success');
            hideForm();
            fetchCarts();
        } catch {
            showMessage('Erro ao criar cliente.', 'error');
        }
    };
}

// ======= INIT =======
document.addEventListener('DOMContentLoaded', () => {
    fetchCarts();
    if (currentCartId) fetchCartItems();
});

// Funções de ação dos botões
function editCart(cartId) {
    showMessage('Função de edição de carrinho ainda não implementada.', 'info');
}
function deleteCart(cartId) {
    const csrftoken = getCookie('csrftoken');
    if (!cartId) return;
    fetch(`${API_CART_URL}${cartId}/`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': csrftoken },
    })
    .then(res => {
        if (!res.ok) throw new Error('Erro ao excluir carrinho');
        showMessage('Carrinho excluído!', 'success');
        fetchCarts();
    })
    .catch(() => showMessage('Erro ao excluir carrinho.', 'error'));
}
