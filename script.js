const vegetables = {};
const API_URL = 'https://crudcrud.com/api/4ebf57eeb0d7424bbbd2f12c10f8ff39/vegetables';

function addVegetable() {
    const name = document.getElementById('vegName').value.trim().toLowerCase();
    const price = parseFloat(document.getElementById('vegPrice').value);
    const qty = parseFloat(document.getElementById('vegQty').value);

    if (!name || isNaN(price) || isNaN(qty)) return alert("Please fill all fields correctly");

    if (vegetables[name]) {
        vegetables[name].quantity += qty;
        vegetables[name].price = price;
        updateVegetableOnServer(name).then(renderList);
    } else {
        const newVeg = { name, price, quantity: qty };
        saveVegetableToServer(newVeg).then(renderList);
    }

    document.getElementById('vegName').value = '';
    document.getElementById('vegPrice').value = '';
    document.getElementById('vegQty').value = '';
}

function saveVegetableToServer(veg) {
    return fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(veg)
    })
    .then(res => res.json())
    .then(data => {
        veg.id = data._id || data.id;
        vegetables[veg.name] = veg;
    });
}

function updateVegetableOnServer(name) {
    const veg = vegetables[name];
    if (!veg.id) return Promise.reject('No ID for update');

    return fetch(`${API_URL}/${veg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(veg)
    });
}

function deleteVeg(name) {
    const veg = vegetables[name];
    if (!veg.id) return console.error('No ID for delete');

    fetch(`${API_URL}/${veg.id}`, { method: 'DELETE' })
        .then(() => {
            delete vegetables[name];
            renderList();
        });
}

function buyVeg(name, btn) {
    const input = btn.previousElementSibling;
    const buyQty = parseFloat(input.value);
    if (isNaN(buyQty) || buyQty <= 0) return alert("Enter a valid quantity");

    if (vegetables[name].quantity < buyQty) return alert("Not enough stock available");

    vegetables[name].quantity -= buyQty;

    if (vegetables[name].quantity === 0) {
        deleteVeg(name).then(renderList);
    } else {
        updateVegetableOnServer(name).then(renderList);
    }
}

function fetchVegetables() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            data.forEach(veg => {
                vegetables[veg.name] = {
                    id: veg._id || veg.id,
                    name: veg.name,
                    price: veg.price,
                    quantity: veg.quantity
                };
            });
            renderList();
        })
        .catch(err => console.error("Failed to fetch vegetables from API:", err));
}

function renderList() {
    const vegList = document.getElementById('vegList');
    vegList.innerHTML = '';

    Object.values(vegetables).forEach((veg) => {
        const div = document.createElement('div');
        div.className = 'veg-item';

        div.innerHTML = `
                <h3>${veg.name.toUpperCase()}</h3>
                <p>Price: ₹${veg.price}/kg</p>
                <p>Quantity: ${veg.quantity} kg</p>

                <div class="customer-controls">
                    <input type="number" placeholder="Enter quantity to buy" min="1" />
                    <button onclick="buyVeg('${veg.name}', this)">Buy</button>
                    <button class="delete-btn" onclick="deleteVeg('${veg.name}')">Delete</button>
                </div>
            `;

        vegList.appendChild(div);
    });

    document.getElementById('vegCount').innerText = Object.keys(vegetables).length;
}

window.onload = fetchVegetables;