const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Dosya yolları
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const CART_FILE = path.join(__dirname, 'data', 'cart.json');
const ACCOUNTS_FILE = path.join(__dirname, 'data', 'accounts.json');

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: '123456'
};

// Dosya okuma fonksiyonu
function readJSONFile(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
        return [];
    }
}

// Dosya yazma fonksiyonu
function writeJSONFile(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// API routes
// Get accounts
app.get('/api/accounts', (req, res) => {
    const accounts = readJSONFile(ACCOUNTS_FILE);
    res.json(accounts);
});

// Add account
app.post('/api/accounts', (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
        }

        const accounts = readJSONFile(ACCOUNTS_FILE);
        const existingAccount = accounts.find(acc => acc.username === username);
        
        if (existingAccount) {
            return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor' });
        }

        const newAccount = {
            id: Date.now().toString(),
            username,
            password,
            email,
            createdAt: new Date().toISOString()
        };

        accounts.push(newAccount);
        writeJSONFile(ACCOUNTS_FILE, accounts);
        
        res.json({ success: true, account: newAccount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            res.json({ success: true, role: 'admin' });
        } else {
            const accounts = readJSONFile(ACCOUNTS_FILE);
            const account = accounts.find(acc => 
                acc.username === username && acc.password === password
            );
            
            if (account) {
                res.json({ success: true, role: 'user' });
            } else {
                res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
            }
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get products
app.get('/api/products', (req, res) => {
    const products = readJSONFile(PRODUCTS_FILE);
    res.json(products);
});

app.post('/api/cart', (req, res) => {
    try {
        const { productId, action } = req.body;
        let cart = readJSONFile(CART_FILE);
        
        if (action === 'add') {
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                const products = readJSONFile(PRODUCTS_FILE);
                const product = products.find(p => p.id === productId);
                if (product) {
                    cart.push({
                        id: productId,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: 1
                    });
                }
            }
            writeJSONFile(CART_FILE, cart);
            res.json({ success: true, cart });
        } else {
            res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
