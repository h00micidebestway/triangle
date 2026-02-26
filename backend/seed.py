"""Run once to populate the database with sample data."""
from database import engine, SessionLocal
import models

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Statuses
if not db.query(models.OrderStatus).first():
    for name in ["Принят", "Оплачен", "Отправлен", "Доставлен", "Отменён"]:
        db.add(models.OrderStatus(name=name))

# Categories
if not db.query(models.Category).first():
    cats = [
        models.Category(name="Летние шины",    slug="summer"),
        models.Category(name="Зимние шины",    slug="winter"),
        models.Category(name="Всесезонные",    slug="allseason"),
        models.Category(name="Внедорожные",    slug="offroad"),
        models.Category(name="Спортивные",     slug="sport"),
    ]
    db.add_all(cats)
    db.flush()

    cat = {c.slug: c.id for c in db.query(models.Category).all()}

    products = [
        # Летние
        dict(category_id=cat["summer"], name="Michelin Pilot Sport 4", brand="Michelin",
             size="225/45 R17", season="summer", speed_index="Y", load_index="91",
             price=15900, stock=8,
             description="Высококлассная летняя шина для спортивного вождения. Отличное сцепление на сухом и мокром асфальте.",
             image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"),
        dict(category_id=cat["summer"], name="Continental ContiSportContact 5", brand="Continental",
             size="205/55 R16", season="summer", speed_index="V", load_index="91",
             price=9800, stock=12,
             description="Надёжная летняя шина с отличными характеристиками на мокрой дороге.",
             image_url="https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=400"),
        dict(category_id=cat["summer"], name="Bridgestone Potenza Sport", brand="Bridgestone",
             size="235/40 R18", season="summer", speed_index="Y", load_index="95",
             price=18500, stock=5,
             description="Премиальная спортивная шина с улучшенным сцеплением и управляемостью.",
             image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"),
        dict(category_id=cat["summer"], name="Pirelli P Zero", brand="Pirelli",
             size="245/35 R20", season="summer", speed_index="Y", load_index="95",
             price=24900, stock=4,
             description="Флагманская шина Pirelli для суперкаров и спортивных автомобилей.",
             image_url="https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=400"),
        dict(category_id=cat["summer"], name="Yokohama Advan Sport V105", brand="Yokohama",
             size="215/50 R17", season="summer", speed_index="W", load_index="95",
             price=11200, stock=10,
             description="Японская спортивная шина с улучшенной управляемостью.",
             image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"),

        # Зимние
        dict(category_id=cat["winter"], name="Nokian Hakkapeliitta 10", brand="Nokian",
             size="205/55 R16", season="winter", speed_index="T", load_index="91",
             price=12400, stock=15,
             description="Лучшая шипованная зимняя шина для суровых условий. Максимальное сцепление на льду.",
             image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"),
        dict(category_id=cat["winter"], name="Michelin X-Ice North 4", brand="Michelin",
             size="195/65 R15", season="winter", speed_index="T", load_index="91",
             price=10800, stock=20,
             description="Шипованная зимняя шина с отличным торможением на льду.",
             image_url="https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=400"),
        dict(category_id=cat["winter"], name="Continental IceContact 3", brand="Continental",
             size="215/55 R17", season="winter", speed_index="T", load_index="98",
             price=13200, stock=9,
             description="Шипованная шина с улучшенной тягой на льду и снегу.",
             image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"),
        dict(category_id=cat["winter"], name="Bridgestone Blizzak DM-V3", brand="Bridgestone",
             size="235/65 R17", season="winter", speed_index="T", load_index="104",
             price=14600, stock=7,
             description="Фрикционная зимняя шина для внедорожников и кроссоверов.",
             image_url="https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=400"),

        # Всесезонные
        dict(category_id=cat["allseason"], name="Michelin CrossClimate 2", brand="Michelin",
             size="205/55 R16", season="allseason", speed_index="V", load_index="91",
             price=11500, stock=11,
             description="Всесезонная шина с сертификатом 3PMSF для зимних условий.",
             image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"),
        dict(category_id=cat["allseason"], name="Continental AllSeasonContact", brand="Continental",
             size="195/65 R15", season="allseason", speed_index="V", load_index="91",
             price=8900, stock=18,
             description="Универсальная шина для круглогодичной эксплуатации.",
             image_url="https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=400"),

        # Внедорожные
        dict(category_id=cat["offroad"], name="BF Goodrich All-Terrain T/A KO2", brand="BF Goodrich",
             size="265/70 R17", season="allseason", speed_index="S", load_index="121",
             price=22000, stock=6,
             description="Легендарная внедорожная шина для самых суровых условий. Усиленные боковины.",
             image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"),
        dict(category_id=cat["offroad"], name="Nokian Rockproof", brand="Nokian",
             size="285/70 R17", season="allseason", speed_index="T", load_index="121",
             price=28500, stock=3,
             description="Сверхпрочная шина для трофи-рейдов с защитой от порезов.",
             image_url="https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=400"),
        dict(category_id=cat["offroad"], name="Maxxis Trepador Bias", brand="Maxxis",
             size="37x12.5 R17", season="allseason", speed_index="P", load_index="124",
             price=35000, stock=2,
             description="Редкий типоразмер для трофийных соревнований. Агрессивный протектор.",
             image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"),

        # Спортивные
        dict(category_id=cat["sport"], name="Michelin Pilot Sport Cup 2", brand="Michelin",
             size="265/35 R19", season="summer", speed_index="Y", load_index="98",
             price=42000, stock=2,
             description="Полуслик для трек-дней. Максимальное сцепление на сухой трассе.",
             image_url="https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=400"),
        dict(category_id=cat["sport"], name="Pirelli Trofeo R", brand="Pirelli",
             size="245/40 R18", season="summer", speed_index="Y", load_index="93",
             price=38000, stock=3,
             description="Гоночная шина омологированная для трековых соревнований.",
             image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"),
    ]

    for p in products:
        db.add(models.Product(**p))

db.commit()
db.close()
print("Database seeded successfully!")
