const vegetables = {};
const API_URL = 'https://crudcrud.com/api/4ebf57eeb0d7424bbbd2f12c10f8ff39/vegetables';

async function addVegetable() {
    const name = document.getElementById('vegName').value.trim().toLowerCase();
    const price = parseFloat(document.getElementById('vegPrice').value);
    const qty = parseFloat(document.getElementById('vegQty').value);

    if (!name || isNaN(price) || isNaN(qty)) return alert("Please fill all fields correctly");

    if (vegetables[name]) {
        vegetables[name].quantity += qty;
        vegetables[name].price = price;
        await updateVegetableOnServer(name);
    } else {
        const newVeg = { name, price, quantity: qty };
        await saveVegetableToServer(newVeg);
    }

    renderList();
    document.getElementById('vegName').value = '';
    document.getElementById('vegPrice').value = '';
    document.getElementById('vegQty').value = '';
}

async function saveVegetableToServer(veg) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(veg)
    });

    const data = await res.json();
    veg.id = data._id || data.id;
    vegetables[veg.name] = veg;
}

async function updateVegetableOnServer(name) {
    const veg = vegetables[name];
    if (!veg.id) return console.error('No ID for update');

    await fetch(`${API_URL}/${veg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(veg)
    });
}

async function deleteVeg(name) {
    const veg = vegetables[name];
    if (!veg.id) return console.error('No ID for delete');

    await fetch(`${API_URL}/${veg.id}`, {
        method: 'DELETE'
    });

    delete vegetables[name];
    renderList();
}

async function buyVeg(name, btn) {
    const input = btn.previousElementSibling;
    const buyQty = parseFloat(input.value);
    if (isNaN(buyQty) || buyQty <= 0) return alert("Enter a valid quantity");

    if (vegetables[name].quantity < buyQty) return alert("Not enough stock available");

    vegetables[name].quantity -= buyQty;

    if (vegetables[name].quantity === 0) {
        await deleteVeg(name);
    } else {
        await updateVegetableOnServer(name);
    }

    renderList();
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

async function fetchVegetables() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        data.forEach(veg => {
            vegetables[veg.name] = {
                id: veg._id || veg.id,
                name: veg.name,
                price: veg.price,
                quantity: veg.quantity
            };
        });

        renderList();
    } catch (err) {
        console.error("Failed to fetch vegetables from API:", err);
    }
}

window.onload = fetchVegetables;
