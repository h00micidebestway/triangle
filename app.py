import sqlite3
import os
from flask import (Flask, render_template, request, session,
                   redirect, url_for, flash, jsonify, g)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.secret_key = "wheelstock-flask-secret-2025"

DB_PATH = os.path.join(os.path.dirname(__file__), "wheelstock.db")

# ── Database helpers ──────────────────────────────────────────────────────

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    db = g.pop("db", None)
    if db:
        db.close()

def q(sql, args=(), one=False):
    cur = get_db().execute(sql, args)
    rv = cur.fetchall()
    return (rv[0] if rv else None) if one else rv

def run(sql, args=()):
    db = get_db()
    cur = db.execute(sql, args)
    db.commit()
    return cur.lastrowid

# ── Init & Seed ───────────────────────────────────────────────────────────

def init_db():
    db = sqlite3.connect(DB_PATH)
    db.execute("PRAGMA foreign_keys = ON")
    db.executescript("""
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER REFERENCES categories(id),
        name TEXT NOT NULL,
        brand TEXT NOT NULL,
        size TEXT NOT NULL,
        season TEXT NOT NULL,
        speed_index TEXT,
        load_index TEXT,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        description TEXT DEFAULT '',
        image_url TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT DEFAULT '',
        created_at TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS order_statuses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        status_id INTEGER REFERENCES order_statuses(id) DEFAULT 1,
        total REAL DEFAULT 0,
        track_num TEXT DEFAULT '',
        created_at TEXT DEFAULT '',
        delivery_city TEXT DEFAULT '',
        delivery_street TEXT DEFAULT '',
        delivery_house TEXT DEFAULT '',
        delivery_zip TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER DEFAULT 1,
        price REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS preorders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT DEFAULT '',
        email TEXT DEFAULT '',
        size TEXT NOT NULL,
        season TEXT DEFAULT '',
        comment TEXT DEFAULT '',
        created_at TEXT DEFAULT ''
    );
    """)

    # Seed statuses
    if not db.execute("SELECT 1 FROM order_statuses").fetchone():
        for s in ["Принят", "Оплачен", "Отправлен", "Доставлен", "Отменён"]:
            db.execute("INSERT INTO order_statuses (name) VALUES (?)", (s,))

    # Seed categories
    if not db.execute("SELECT 1 FROM categories").fetchone():
        cats = [("Летние шины","summer"),("Зимние шины","winter"),
                ("Всесезонные","allseason"),("Внедорожные","offroad"),("Спортивные","sport")]
        for name, slug in cats:
            db.execute("INSERT INTO categories (name,slug) VALUES (?,?)", (name, slug))

    # Seed products
    if not db.execute("SELECT 1 FROM products").fetchone():
        img1 = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
        img2 = "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=400"
        products = [
            (1,"Michelin Pilot Sport 4","Michelin","225/45 R17","summer","Y","91",15900,8,"Высококлассная летняя шина для спортивного вождения. Отличное сцепление на сухом и мокром асфальте.",img1),
            (1,"Continental ContiSportContact 5","Continental","205/55 R16","summer","V","91",9800,12,"Надёжная летняя шина с отличными характеристиками на мокрой дороге.",img2),
            (1,"Bridgestone Potenza Sport","Bridgestone","235/40 R18","summer","Y","95",18500,5,"Премиальная спортивная шина с улучшенным сцеплением.",img1),
            (1,"Pirelli P Zero","Pirelli","245/35 R20","summer","Y","95",24900,4,"Флагманская шина Pirelli для суперкаров.",img2),
            (1,"Yokohama Advan Sport V105","Yokohama","215/50 R17","summer","W","95",11200,10,"Японская спортивная шина с улучшенной управляемостью.",img1),
            (2,"Nokian Hakkapeliitta 10","Nokian","205/55 R16","winter","T","91",12400,15,"Лучшая шипованная зимняя шина для суровых условий.",img1),
            (2,"Michelin X-Ice North 4","Michelin","195/65 R15","winter","T","91",10800,20,"Шипованная зимняя шина с отличным торможением на льду.",img2),
            (2,"Continental IceContact 3","Continental","215/55 R17","winter","T","98",13200,9,"Шипованная шина с улучшенной тягой на льду.",img1),
            (2,"Bridgestone Blizzak DM-V3","Bridgestone","235/65 R17","winter","T","104",14600,7,"Фрикционная зимняя шина для внедорожников.",img2),
            (3,"Michelin CrossClimate 2","Michelin","205/55 R16","allseason","V","91",11500,11,"Всесезонная шина с сертификатом 3PMSF.",img1),
            (3,"Continental AllSeasonContact","Continental","195/65 R15","allseason","V","91",8900,18,"Универсальная шина для круглогодичной эксплуатации.",img2),
            (4,"BF Goodrich All-Terrain T/A KO2","BF Goodrich","265/70 R17","allseason","S","121",22000,6,"Легендарная внедорожная шина с усиленными боковинами.",img1),
            (4,"Nokian Rockproof","Nokian","285/70 R17","allseason","T","121",28500,3,"Сверхпрочная шина для трофи-рейдов.",img2),
            (4,"Maxxis Trepador Bias","Maxxis","37x12.5 R17","allseason","P","124",35000,2,"Редкий типоразмер для трофийных соревнований.",img1),
            (5,"Michelin Pilot Sport Cup 2","Michelin","265/35 R19","summer","Y","98",42000,2,"Полуслик для трек-дней. Максимальное сцепление.",img2),
            (5,"Pirelli Trofeo R","Pirelli","245/40 R18","summer","Y","93",38000,3,"Гоночная шина для трековых соревнований.",img1),
        ]
        for p in products:
            db.execute("""INSERT INTO products
                (category_id,name,brand,size,season,speed_index,load_index,
                 price,stock,description,image_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)""", p)

    db.commit()
    db.close()

# ── Context processor ─────────────────────────────────────────────────────

@app.context_processor
def inject_cart():
    cart = session.get("cart", {})
    count = sum(v["qty"] for v in cart.values())
    total = sum(v["qty"] * v["price"] for v in cart.values())
    return dict(cart_count=count, cart_total=total,
                current_user=session.get("user"))

# ── Auth ──────────────────────────────────────────────────────────────────

@app.route("/login", methods=["GET","POST"])
def login():
    if request.method == "POST":
        email    = request.form["email"].strip()
        password = request.form["password"]
        user = q("SELECT * FROM users WHERE email=?", (email,), one=True)
        if user and check_password_hash(user["password_hash"], password):
            session["user"] = {"id": user["id"], "name": user["name"], "email": user["email"]}
            flash("Добро пожаловать, " + user["name"] + "!", "success")
            return redirect(url_for("index"))
        flash("Неверный email или пароль", "error")
    return render_template("login.html")

@app.route("/register", methods=["GET","POST"])
def register():
    if request.method == "POST":
        name     = request.form["name"].strip()
        email    = request.form["email"].strip()
        password = request.form["password"]
        phone    = request.form.get("phone","").strip()
        if len(password) < 6:
            flash("Пароль должен быть не менее 6 символов", "error")
            return render_template("register.html")
        if q("SELECT 1 FROM users WHERE email=?", (email,), one=True):
            flash("Email уже зарегистрирован", "error")
            return render_template("register.html")
        uid = run("INSERT INTO users (name,email,password_hash,phone,created_at) VALUES (?,?,?,?,?)",
                  (name, email, generate_password_hash(password), phone, datetime.now().isoformat()))
        session["user"] = {"id": uid, "name": name, "email": email}
        flash("Аккаунт создан!", "success")
        return redirect(url_for("index"))
    return render_template("register.html")

@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("index"))

# ── Pages ─────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    featured = q("""SELECT p.*, c.name as cat_name FROM products p
                    LEFT JOIN categories c ON p.category_id=c.id
                    ORDER BY p.price DESC LIMIT 8""")
    cats = q("SELECT * FROM categories")
    return render_template("index.html", products=featured, categories=cats)

@app.route("/catalog")
def catalog():
    season   = request.args.get("season","")
    brand    = request.args.get("brand","")
    search   = request.args.get("search","")
    min_p    = request.args.get("min_price","")
    max_p    = request.args.get("max_price","")
    sort     = request.args.get("sort","price_asc")

    sql  = """SELECT p.*, c.name as cat_name FROM products p
              LEFT JOIN categories c ON p.category_id=c.id WHERE 1=1"""
    args = []
    if season:  sql += " AND p.season=?";        args.append(season)
    if brand:   sql += " AND p.brand LIKE ?";    args.append(f"%{brand}%")
    if search:  sql += " AND (p.name LIKE ? OR p.brand LIKE ? OR p.size LIKE ?)"; args += [f"%{search}%"]*3
    if min_p:   sql += " AND p.price>=?";        args.append(float(min_p))
    if max_p:   sql += " AND p.price<=?";        args.append(float(max_p))

    order_map = {"price_asc":"p.price ASC","price_desc":"p.price DESC","default":"p.id ASC"}
    sql += f" ORDER BY {order_map.get(sort,'p.price ASC')}"

    products = q(sql, args)
    brands   = [r[0] for r in q("SELECT DISTINCT brand FROM products ORDER BY brand")]
    return render_template("catalog.html", products=products, brands=brands,
                           season=season, brand=brand, search=search,
                           min_p=min_p, max_p=max_p, sort=sort)

@app.route("/product/<int:pid>")
def product(pid):
    p = q("""SELECT p.*, c.name as cat_name FROM products p
             LEFT JOIN categories c ON p.category_id=c.id WHERE p.id=?""", (pid,), one=True)
    if not p:
        flash("Товар не найден", "error")
        return redirect(url_for("catalog"))
    related = q("""SELECT * FROM products WHERE season=? AND id!=? ORDER BY RANDOM() LIMIT 4""",
                (p["season"], pid))
    return render_template("product.html", p=p, related=related)

# ── Cart ──────────────────────────────────────────────────────────────────

@app.route("/cart")
def cart():
    cart = session.get("cart", {})
    items = []
    for pid, v in cart.items():
        items.append(v)
    return render_template("cart.html", items=items)

@app.route("/cart/add/<int:pid>", methods=["POST"])
def cart_add(pid):
    p = q("SELECT * FROM products WHERE id=?", (pid,), one=True)
    if not p:
        return redirect(url_for("catalog"))
    qty  = int(request.form.get("qty", 1))
    cart = session.get("cart", {})
    key  = str(pid)
    if key in cart:
        cart[key]["qty"] += qty
    else:
        cart[key] = {"id": pid, "name": p["name"], "brand": p["brand"],
                     "size": p["size"], "price": p["price"],
                     "image_url": p["image_url"], "qty": qty}
    session["cart"] = cart
    flash(f"«{p['name']}» добавлен в корзину", "success")
    return redirect(request.referrer or url_for("catalog"))

@app.route("/cart/update/<int:pid>", methods=["POST"])
def cart_update(pid):
    qty  = int(request.form.get("qty", 1))
    cart = session.get("cart", {})
    key  = str(pid)
    if qty <= 0:
        cart.pop(key, None)
    elif key in cart:
        cart[key]["qty"] = qty
    session["cart"] = cart
    return redirect(url_for("cart"))

@app.route("/cart/remove/<int:pid>")
def cart_remove(pid):
    cart = session.get("cart", {})
    cart.pop(str(pid), None)
    session["cart"] = cart
    return redirect(url_for("cart"))

@app.route("/cart/clear")
def cart_clear():
    session.pop("cart", None)
    return redirect(url_for("cart"))

# ── Checkout & Orders ─────────────────────────────────────────────────────

@app.route("/checkout", methods=["GET","POST"])
def checkout():
    if not session.get("user"):
        flash("Войдите, чтобы оформить заказ", "error")
        return redirect(url_for("login"))
    cart = session.get("cart", {})
    if not cart:
        return redirect(url_for("cart"))

    if request.method == "POST":
        city   = request.form.get("city","").strip()
        street = request.form.get("street","").strip()
        house  = request.form.get("house","").strip()
        zipcode= request.form.get("zip","").strip()
        if not city or not street or not house:
            flash("Заполните адрес доставки", "error")
            return render_template("checkout.html", cart=cart)

        total = sum(v["qty"] * v["price"] for v in cart.values())
        uid   = session["user"]["id"]
        oid   = run("""INSERT INTO orders
                    (user_id,status_id,total,created_at,delivery_city,delivery_street,delivery_house,delivery_zip)
                    VALUES (?,1,?,?,?,?,?,?)""",
                   (uid, total, datetime.now().isoformat(), city, street, house, zipcode))
        for v in cart.values():
            run("INSERT INTO order_items (order_id,product_id,quantity,price) VALUES (?,?,?,?)",
                (oid, v["id"], v["qty"], v["price"]))

        session.pop("cart", None)
        flash("Заказ оформлен!", "success")
        return redirect(url_for("order_detail", oid=oid))

    return render_template("checkout.html", cart=cart)

@app.route("/orders")
def orders():
    if not session.get("user"):
        return redirect(url_for("login"))
    uid = session["user"]["id"]
    ords = q("""SELECT o.*, s.name as status_name FROM orders o
                LEFT JOIN order_statuses s ON o.status_id=s.id
                WHERE o.user_id=? ORDER BY o.id DESC""", (uid,))
    return render_template("orders.html", orders=ords)

@app.route("/orders/<int:oid>")
def order_detail(oid):
    if not session.get("user"):
        return redirect(url_for("login"))
    uid = session["user"]["id"]
    o = q("""SELECT o.*, s.name as status_name FROM orders o
             LEFT JOIN order_statuses s ON o.status_id=s.id
             WHERE o.id=? AND o.user_id=?""", (oid, uid), one=True)
    if not o:
        flash("Заказ не найден", "error")
        return redirect(url_for("orders"))
    items = q("""SELECT oi.*, p.name as product_name, p.brand, p.size
                 FROM order_items oi LEFT JOIN products p ON oi.product_id=p.id
                 WHERE oi.order_id=?""", (oid,))
    return render_template("order_detail.html", o=o, items=items)

# ── Preorder ──────────────────────────────────────────────────────────────

@app.route("/preorder", methods=["GET","POST"])
def preorder():
    user = session.get("user")
    if request.method == "POST":
        name    = request.form.get("name","").strip()
        email   = request.form.get("email","").strip()
        size    = request.form.get("size","").strip()
        season  = request.form.get("season","summer")
        comment = request.form.get("comment","").strip()
        if not size:
            flash("Укажите типоразмер", "error")
            return render_template("preorder.html", user=user)
        run("""INSERT INTO preorders (user_id,name,email,size,season,comment,created_at)
               VALUES (?,?,?,?,?,?,?)""",
            (user["id"] if user else None, name, email, size, season, comment,
             datetime.now().isoformat()))
        flash("Заявка принята! Мы свяжемся с вами в ближайшее время.", "success")
        return redirect(url_for("preorder"))
    return render_template("preorder.html", user=user)

# ── API (для AJAX поиска в каталоге) ─────────────────────────────────────

@app.route("/api/products")
def api_products():
    season = request.args.get("season","")
    search = request.args.get("search","")
    brand  = request.args.get("brand","")
    sql    = "SELECT * FROM products WHERE 1=1"
    args   = []
    if season: sql += " AND season=?";           args.append(season)
    if brand:  sql += " AND brand LIKE ?";       args.append(f"%{brand}%")
    if search: sql += " AND (name LIKE ? OR brand LIKE ? OR size LIKE ?)"; args += [f"%{search}%"]*3
    sql += " ORDER BY price ASC LIMIT 40"
    rows = q(sql, args)
    return jsonify([dict(r) for r in rows])

# ── Run ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    print("\n  WheelStock запущен!")
    print("  Открой в браузере: http://localhost:5000\n")
    app.run(debug=True, port=5000)
