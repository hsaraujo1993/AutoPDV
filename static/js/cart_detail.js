// cart_detail.js
const API_CART_URL = '/api/v1/carts/';
const API_CARTITEM_URL = '/api/v1/cart-items/';
const API_PRODUCTS_URL = '/api/v1/products/';
const API_PRICES_URL = '/api/v1/prices/';

const cartId = document.getElementById('cart-items-container').getAttribute('data-cart-id') || window.cart_id;
const cartItemsContainer = document.getElementById('cart-items-container');
const formContainer = document.getElementById('form-container');
const messagesDiv = document.getElementById('messages');
const finalizeBtn = document.getElementById('finalize-cart-btn');

let productsCache = null;
let pricesCache = null;
window.cartItems = []; // Variável global para armazenar os itens do carrinho

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
    if (type !== 'error') {
        setTimeout(() => messagesDiv.innerHTML = '', timeout);
    }
}

function calculateTotal(items) {
    return items.reduce((sum, i) => sum + i.quantity * (parseFloat(i.unit_price) || 0), 0);
}

console.log('cart_detail.js carregado');

async function fetchPricesMap() {
    if (pricesCache) return pricesCache;
    try {
        const res = await fetch(API_PRICES_URL);
        if (!res.ok) throw new Error(`Erro ao carregar preços ${res.status}`);
        const prices = await res.json();
        const pricesMap = prices.reduce((map, p) => {
            map[p.product] = p.sale_price;
            return map;
        }, {});
        pricesCache = pricesMap;
        return pricesMap;
    } catch (e) {
        showMessage('Erro ao carregar lista de preços.', 'error');
        console.error("Erro ao carregar preços:", e);
        return {};
    }
}

async function fetchProductsNameMap() {
    if (productsCache) return productsCache;
    try {
        const res = await await fetch(API_PRODUCTS_URL);
        if (!res.ok) throw new Error(`Erro ao carregar produtos ${res.status}`);
        const products = await res.json();
        const namesMap = products.reduce((map, p) => {
            map[p.id] = p.name;
            return map;
        }, {});
        productsCache = namesMap;
        return namesMap;
    } catch (e) {
        showMessage('Erro ao carregar lista de produtos (nomes).', 'error');
        console.error("Erro ao carregar produtos:", e);
        return {};
    }
}

async function fetchCartItems() {
    if (!cartId) {
        console.log('cartId não encontrado');
        return;
    }
    try {
        const itemsRes = await fetch(`${API_CART_URL}${cartId}/items/`);
        console.log('fetchCartItems status:', itemsRes.status);
        if (!itemsRes.ok) throw new Error(`Erro ${itemsRes.status} ao buscar itens do carrinho`);
        const items = await itemsRes.json();

        const pricesMap = await fetchPricesMap();
        const namesMap = await fetchProductsNameMap();

        const enrichedItems = items.map(item => {
            const productId = item.product;
            item.unit_price = pricesMap[productId] || 0;
            item.product_name = namesMap[productId] || 'Produto Desconhecido';
            return item;
        });

        console.log('Itens enriquecidos (com preço e nome):', enrichedItems);
        window.cartItems = enrichedItems;
        renderCart(enrichedItems);
    } catch (e) {
        showMessage('Erro ao carregar ou processar itens do carrinho.', 'error');
        console.error("Erro em fetchCartItems:", e);
    }
}

function renderCart(items) {
    console.log('renderCart chamada, itens:', items);
    if (!items) items = [];

    const total = calculateTotal(items);
    const tableBody = document.querySelector('.styled-table tbody');
    const totalElement = document.querySelector('.total-amount');

    if (tableBody) {
        const htmlRows = items.map(i => {
            const unitPrice = parseFloat(i.unit_price) || 0;
            const subtotal = i.quantity * unitPrice;
            return `
                <tr>
                    <td>${i.product_name || 'Produto sem Nome'}</td>
                    <td>${i.quantity}</td>
                    <td>${unitPrice.toFixed(2)}</td>
                    <td>${subtotal.toFixed(2)}</td>
                    <td style="text-align:center;">
                        <button class="btn edit" onclick="editItem('${i.id}')">Editar</button>
                        <button class="btn delete" onclick="deleteItem('${i.id}')">Excluir</button>
                    </td>
                </tr>
            `;
        }).join('');
        tableBody.innerHTML = htmlRows || `<tr><td colspan="5" style="text-align:center; padding:1rem;">Nenhum item no carrinho.</td></tr>`;
    }

    if (totalElement) {
        totalElement.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
    }
    console.log('HTML do carrinho renderizado');
}

window.showAddItemForm = async function() {
    formContainer.style.display = 'block';

    try {
        const [productsRes, pricesRes] = await Promise.all([
            fetch(API_PRODUCTS_URL),
            fetch(API_PRICES_URL)
        ]);

        if (!productsRes.ok || !pricesRes.ok) {
             throw new Error("Erro ao carregar dados do produto/preço para o formulário.");
        }

        const products = await productsRes.json();
        const prices = await pricesRes.json();

        const pricesMap = prices.reduce((map, p) => {
            map[p.product] = p.sale_price;
            return map;
        }, {});

        const selectOptions = products.map(p => {
            const price = parseFloat(pricesMap[p.id] || 0).toFixed(2);
            return `<option value="${p.id}" data-stock="${p.stock_quantity}">${p.name} (R$ ${price}) - Estoque: ${p.stock_quantity}</option>`;
        }).join('');

        formContainer.innerHTML = `
            <form id="add-item-form">
                <select name="product" required>${selectOptions}</select>
                <input type="number" name="quantity" placeholder="Quantidade" required min="1" max="0">
                <button type="submit" class="btn create-btn">Adicionar</button>
                <button type="button" class="btn" onclick="hideForm()">Cancelar</button>
            </form>
        `;

        const select = formContainer.querySelector('select[name=product]');
        const quantityInput = formContainer.querySelector('input[name=quantity]');

        const selectedOption = select.options[select.selectedIndex];
        if (selectedOption) {
            quantityInput.max = selectedOption.dataset.stock;
        }

        select.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            quantityInput.max = selectedOption.dataset.stock;
            quantityInput.value = 1;
        });

    } catch(e) {
        showMessage('Erro ao carregar produtos para o formulário.', 'error');
        console.error("Erro ao carregar produtos para form:", e);
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

async function addItem(productId, quantity) {
    if (!cartId || !productId || quantity <= 0) return showMessage('Dados inválidos.', 'error');
    const csrftoken = getCookie('csrftoken');
    const pricesMap = await fetchPricesMap();
    const unitPrice = pricesMap[productId] || 0;

    if (unitPrice === 0) {
        showMessage('Preço do produto não encontrado.', 'error');
        return;
    }

    try {
        const res = await fetch(API_CARTITEM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                cart: cartId,
                product: productId,
                quantity: quantity,
                unit_price: unitPrice
            })
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        hideForm();
        fetchCartItems();
        showMessage('Item adicionado ao carrinho!', 'success');
    } catch(e) {
        showMessage('Erro ao adicionar item.', 'error');
        console.error("Erro ao adicionar item:", e);
    }
}

window.editItem = function(id) {
    const itemId = parseInt(id);
    const item = window.cartItems.find(i => i.id === itemId);

    if (!item) {
        showMessage('Item não encontrado para edição.', 'error');
        return;
    }

    formContainer.style.display = 'block';
    formContainer.innerHTML = `
        <form id="edit-item-form">
            <h3>Editar Quantidade</h3>
            <p>Produto: ${item.product_name}</p>
            <input type="hidden" name="id" value="${item.id}">
            <input type="number" name="quantity" value="${item.quantity}" required min="1">
            <button type="submit" class="btn update-btn">Salvar</button>
            <button type="button" class="btn" onclick="hideForm()">Cancelar</button>
        </form>
    `;

    const form = document.getElementById('edit-item-form');
    form.onsubmit = e => {
        e.preventDefault();
        const newQuantity = parseInt(form.querySelector('input[name="quantity"]').value);
        if (newQuantity > 0) {
            updateItemQuantity(item.id, newQuantity);
        } else {
            showMessage('A quantidade deve ser maior que zero.', 'error');
        }
    };
}

async function updateItemQuantity(itemId, newQuantity) {
    if (!cartId || !itemId) {
        showMessage('Dados inválidos para atualização.', 'error');
        return;
    }

    const updateUrl = `${API_CART_URL}${cartId}/update-item/${parseInt(itemId)}/`;

    try {
        const res = await fetch(updateUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (!res.ok) throw new Error(`Erro ${res.status} ao atualizar a quantidade.`);

        hideForm();
        fetchCartItems();
        showMessage('Quantidade atualizada!', 'success');
    } catch(e) {
        showMessage('Erro ao atualizar a quantidade.', 'error');
        console.error("Erro ao atualizar a quantidade:", e);
    }
}

window.deleteItem = async function(itemId) {
    if (!itemId || !cartId) return;
    const deleteUrl = `${API_CART_URL}${cartId}/remove-item/${parseInt(itemId)}/`;
    try {
        const res = await fetch(deleteUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
        });
        if (res.status === 204 || res.ok) {
            fetchCartItems();
            showMessage('Item excluído!', 'success');
        } else {
            throw new Error(`Erro ${res.status} ao tentar excluir item.`);
        }
    } catch(e) {
        showMessage('Erro ao excluir item.', 'error');
        console.error("Erro ao excluir item:", e);
    }
}

function hideForm() {
    formContainer.style.display = 'none';
    formContainer.innerHTML = '';
}

if (finalizeBtn) {
    finalizeBtn.onclick = async () => {
        try {
            const res = await fetch(`${API_CART_URL}${cartId}/finalize/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
            });
            if (!res.ok) throw new Error(`Erro ${res.status}`);
            showMessage('Pedido finalizado!', 'success');
            fetchCartItems();
        } catch(e) {
            showMessage('Erro ao finalizar pedido.', 'error');
            console.error("Erro ao finalizar pedido:", e);
        }
    };
}

document.addEventListener('DOMContentLoaded', fetchCartItems);