# Dokumentowe bazy danych – MongoDB

Ćwiczenie 2

---

**Imiona i nazwiska autorów:**

---

Odtwórz z backupu bazę `north0`

- najprostsza wersja

```
mongorestore dump
```

- to polecenie odtworzy wszystkie bazy danych znajdujące się we wskazanym folderze (w tym przypadku `dump`)
  - najłatwiej wgrać tam folder zawierający pliki z backupem i wykonać proste polecenie mongorestore
- dokumentacja:
  - https://www.mongodb.com/docs/database-tools/mongorestore/

Wybierz bazę north0

Baza `north0` jest kopią relacyjnej bazy danych `Northwind`

- poszczególne kolekcje odpowiadają tabelom w oryginalnej bazie `Northwind`

# Zadanie 0

zapoznaj się ze strukturą dokumentów w bazie `North0`

```js
db.customers.find();
db.orders.find();
db.orderdetails.find();
```

# Zadanie 1 - operacje wyszukiwania danych, przetwarzanie dokumentów

# a)

stwórz kolekcję `OrdersInfo` zawierającą następujące dane o zamówieniach

- kolekcję `OrdersInfo` należy stworzyć przekształcając dokumenty w oryginalnych kolekcjach `customers, orders, orderdetails, employees, shippers, products, categories, suppliers` do kolekcji w której pojedynczy dokument opisuje jedno zamówienie

spodziewany wynik:

```js
[
  {
    "_id": ...

    OrderID": ... numer zamówienia

    "Customer": {  ... podstawowe informacje o kliencie skladającym
      "CustomerID": ... identyfikator klienta
      "CompanyName": ... nazwa klienta
      "City": ... miasto
      "Country": ... kraj
    },

    "Employee": {  ... podstawowe informacje o pracowniku obsługującym zamówienie
      "EmployeeID": ... idntyfikator pracownika
      "FirstName": ... imie
      "LastName": ... nazwisko
      "Title": ... stanowisko

    },

    "Dates": {
       "OrderDate": ... data złożenia zamówienia
       "RequiredDate": data wymaganej realizacji
    }

    "Orderdetails": [  ... pozycje/szczegóły zamówienia - tablica takich pozycji
      {
        "UnitPrice": ... cena
        "Quantity": ... liczba sprzedanych jednostek towaru
        "Discount": ... zniżka
        "Value": ... wartośc pozycji zamówienia
        "product": { ... podstawowe informacje o produkcie
          "ProductID": ... identyfikator produktu
          "ProductName": ... nazwa produktu
          "QuantityPerUnit": ... opis/opakowannie
          "CategoryID": ... identyfikator kategorii do której należy produkt
          "CategoryName" ... nazwę tej kategorii
        },
      },
      ...
    ],

    "Freight": ... opłata za przesyłkę
    "OrderTotal"  ... sumaryczna wartosc sprzedanych produktów

    "Shipment" : {  ... informacja o wysyłce
        "Shipper": { ... podstawowe inf o przewoźniku
           "ShipperID":
            "CompanyName":
        }
        ... inf o odbiorcy przesyłki
        "ShipName": ...
        "ShipAddress": ...
        "ShipCity": ...
        "ShipCountry": ...
    }
  }
]
```

# b)

stwórz kolekcję `CustomerInfo` zawierającą następujące dane każdym kliencie

- pojedynczy dokument opisuje jednego klienta

spodziewany wynik:

```js
[
  {
    "_id": ...

    "CustomerID": ... identyfikator klienta
    "CompanyName": ... nazwa klienta
    "City": ... miasto
    "Country": ... kraj

	"Orders": [ ... tablica zamówień klienta o strukturze takiej jak w punkcie a)
	                (oczywiście bez informacji o kliencie)

	]


]
```

# c)

Napisz polecenie/zapytanie: Dla każdego klienta pokaż wartość zakupionych przez niego produktów z kategorii 'Confections' w 1997r

- Spróbuj napisać to zapytanie wykorzystując
  - oryginalne kolekcje (`customers, orders, orderdertails, products, categories`)
  - kolekcję `OrderInfo`
  - kolekcję `CustomerInfo`

- porównaj zapytania/polecenia/wyniki

```js
[
  {
    "_id":

    "CustomerID": ... identyfikator klienta
    "CompanyName": ... nazwa klienta
	"ConfectionsSale97": ... wartość zakupionych przez niego produktów
	                         z kategorii 'Confections'  w 1997r

  }
]
```

# d)

Napisz polecenie/zapytanie: Dla każdego klienta poaje wartość sprzedaży z podziałem na lata i miesiące
Spróbuj napisać to zapytanie wykorzystując - oryginalne kolekcje (`customers, orders, orderdertails, products, categories`) - kolekcję `OrderInfo` - kolekcję `CustomerInfo`

- porównaj zapytania/polecenia/wyniki

```js
[
  {
    "_id":

    "CustomerID": ... identyfikator klienta
    "CompanyName": ... nazwa klienta

	"Sale": [ ... tablica zawierająca inf o sprzedazy
	    {
            "Year":  ....
            "Month": ....
            "Total": ...
	    }
	    ...
	]
  }
]
```

# e)

Załóżmy że pojawia się nowe zamówienie dla klienta 'ALFKI', zawierające dwa produkty 'Chai' oraz "Ikura"

- pozostałe pola w zamówieniu (ceny, liczby sztuk prod, inf o przewoźniku itp. możesz uzupełnić wg własnego uznania)
  Napisz polecenie które dodaje takie zamówienie do bazy
- aktualizując oryginalne kolekcje `orders`, `orderdetails`
- aktualizując kolekcję `OrderInfo`
- aktualizując kolekcję `CustomerInfo`

Napisz polecenie

- aktualizując oryginalną kolekcję orderdetails`
- aktualizując kolekcję `OrderInfo`
- aktualizując kolekcję `CustomerInfo`

# f)

Napisz polecenie które modyfikuje zamówienie dodane w pkt e) zwiększając zniżkę o 5% (dla każdej pozycji tego zamówienia)

Napisz polecenie

- aktualizując oryginalną kolekcję `orderdetails`
- aktualizując kolekcję `OrderInfo`
- aktualizując kolekcję `CustomerInfo`

UWAGA:
W raporcie należy zamieścić kod poleceń oraz uzyskany rezultat, np wynik polecenia `db.kolekcka.fimd().limit(2)` lub jego fragment

## Zadanie 1 - rozwiązanie

> Wyniki:
>
> przykłady, kod, zrzuty ekranów, komentarz ...

a)

```js
db.orders.aggregate([
  {
    $lookup: {
      from: "customers",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "customer_info",
    },
  },
  { $set: { customer_info: { $arrayElemAt: ["$customer_info", 0] } } },

  {
    $lookup: {
      from: "employees",
      localField: "EmployeeID",
      foreignField: "EmployeeID",
      as: "employee_info",
    },
  },
  { $set: { employee_info: { $arrayElemAt: ["$employee_info", 0] } } },

  {
    $lookup: {
      from: "shippers",
      localField: "ShipVia",
      foreignField: "ShipperID",
      as: "shipper_info",
    },
  },
  { $set: { shipper_info: { $arrayElemAt: ["$shipper_info", 0] } } },

  {
    $lookup: {
      from: "orderdetails",
      localField: "OrderID",
      foreignField: "OrderID",
      as: "order_info",
      pipeline: [
        {
          $lookup: {
            from: "products",
            localField: "ProductID",
            foreignField: "ProductID",
            as: "product_info",
          },
        },
        { $set: { product_info: { $arrayElemAt: ["$product_info", 0] } } },
        {
          $lookup: {
            from: "categories",
            localField: "product_info.CategoryID",
            foreignField: "CategoryID",
            as: "category_info",
          },
        },
        { $set: { category_info: { $arrayElemAt: ["$category_info", 0] } } },
      ],
    },
  },

  {
    $project: {
      OrderID: 1,
      Freight: 1,

      Customer: {
        CustomerID: "$customer_info.CustomerID",
        CompanyName: "$customer_info.CompanyName",
        City: "$customer_info.City",
        Country: "$customer_info.Country",
      },

      Employee: {
        EmployeeID: "$employee_info.EmployeeID",
        FirstName: "$employee_info.FirstName",
        LastName: "$employee_info.LastName",
        Title: "$employee_info.Title",
      },

      Dates: {
        OrderDate: "$OrderDate",
        RequiredDate: "$RequiredDate",
      },

      Orderdetails: {
        $map: {
          input: "$order_info",
          as: "detail",
          in: {
            UnitPrice: "$$detail.UnitPrice",
            Quantity: "$$detail.Quantity",
            Discount: "$$detail.Discount",
            Value: {
              $multiply: [
                "$$detail.UnitPrice",
                "$$detail.Quantity",
                { $subtract: [1, "$$detail.Discount"] },
              ],
            },
            product: {
              ProductID: "$$detail.ProductID",
              ProductName: "$$detail.product_info.ProductName",
              QuantityPerUnit: "$$detail.product_info.QuantityPerUnit",
              CategoryID: "$$detail.product_info.CategoryID",
              CategoryName: "$$detail.category_info.CategoryName",
            },
          },
        },
      },

      OrderTotal: {
        $sum: {
          $map: {
            input: "$order_info",
            as: "detail",
            in: {
              $multiply: [
                "$$detail.UnitPrice",
                "$$detail.Quantity",
                { $subtract: [1, "$$detail.Discount"] },
              ],
            },
          },
        },
      },

      Shipment: {
        Shipper: {
          ShipperID: "$shipper_info.ShipperID",
          CompanyName: "$shipper_info.CompanyName",
        },
        ShipName: "$ShipName",
        ShipAddress: "$ShipAddress",
        ShipCity: "$ShipCity",
        ShipCountry: "$ShipCountry",
      },
    },
  },

  { $out: "OrdersInfo" },
]);


//Fragment wykonania
[
  {
    "_id": {"$oid": "63a060b9bb3b972d6f4e1fc6"},
    "Customer": {
      "CustomerID": "VINET",
      "CompanyName": "Vins et alcools Chevalier",
      "City": "Reims",
      "Country": "France"
    },
    "Dates": {
      "OrderDate": {"$date": "1996-07-04T00:00:00.000Z"},
      "RequiredDate": {"$date": "1996-08-01T00:00:00.000Z"}
    },
    "Employee": {
      "EmployeeID": 5,
      "FirstName": "Steven",
      "LastName": "Buchanan",
      "Title": "Sales Manager"
    },
    "Freight": 32.38,
    "OrderID": 10248,
    "OrderTotal": 440,
    "Orderdetails": [
      {
        "UnitPrice": 14,
        "Quantity": 12,
        "Discount": 0,
        "Value": 168,
        "product": {
          "ProductID": 11,
          "ProductName": "Queso Cabrales",
          "QuantityPerUnit": "1 kg pkg.",
          "CategoryID": 4,
          "CategoryName": "Dairy Products"
        }
      },
      {
        "UnitPrice": 9.8,
        "Quantity": 10,
        "Discount": 0,
        "Value": 98,
        "product": {
          "ProductID": 42,
          "ProductName": "Singaporean Hokkien Fried Mee",
          "QuantityPerUnit": "32 - 1 kg pkgs.",
          "CategoryID": 5,
          "CategoryName": "Grains/Cereals"
        }
      },
      {
        "UnitPrice": 34.8,
        "Quantity": 5,
        "Discount": 0,
        "Value": 174,
        "product": {
          "ProductID": 72,
          "ProductName": "Mozzarella di Giovanni",
          "QuantityPerUnit": "24 - 200 g pkgs.",
          "CategoryID": 4,
          "CategoryName": "Dairy Products"
        }
      }
    ],
    "Shipment": {
      "Shipper": {
        "ShipperID": 3,
        "CompanyName": "Federal Shipping"
      },
      "ShipName": "Vins et alcools Chevalier",
      "ShipAddress": "59 rue de l'Abbaye",
      "ShipCity": "Reims",
      "ShipCountry": "France"
    }
  }] ...
```

b)

```js
db.customers.aggregate([
  {
    $lookup: {
      from: "OrdersInfo",
      localField: "CustomerID",
      foreignField: "Customer.CustomerID",
      as: "Orders"
    }
  },
  {
    $project: {
      CustomerID: 1,
      CompanyName: 1,
      City: 1,
      Country: 1,
      "Orders.OrderID": 1,
      "Orders.Employee": 1,
      "Orders.Dates": 1,
      "Orders.Orderdetails": 1,
      "Orders.Freight": 1,
      "Orders.OrderTotal": 1,
      "Orders.Shipment": 1
    }
  },
  { $out: "CustomerInfo" }
]);


//Fragment wykonania
[
  {
    "_id": {"$oid": "63a05cdfbb3b972d6f4e097b"},
    "City": "Berlin",
    "CompanyName": "Alfreds Futterkiste",
    "Country": "Germany",
    "CustomerID": "ALFKI",
    "Orders": [
      {
        "OrderID": 10643,
        "Freight": 29.46,
        "Employee": {
          "EmployeeID": 6,
          "FirstName": "Michael",
          "LastName": "Suyama",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-08-25T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-09-22T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 45.6,
            "Quantity": 15,
            "Discount": 0.25,
            "Value": 513,
            "product": {
              "ProductID": 28,
              "ProductName": "Rössle Sauerkraut",
              "QuantityPerUnit": "25 - 825 g cans",
              "CategoryID": 7,
              "CategoryName": "Produce"
            }
          },
          {
            "UnitPrice": 18,
            "Quantity": 21,
            "Discount": 0.25,
            "Value": 283.5,
            "product": {
              "ProductID": 39,
              "ProductName": "Chartreuse verte",
              "QuantityPerUnit": "750 cc per bottle",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          },
          {
            "UnitPrice": 12,
            "Quantity": 2,
            "Discount": 0.25,
            "Value": 18,
            "product": {
              "ProductID": 46,
              "ProductName": "Spegesild",
              "QuantityPerUnit": "4 - 450 g glasses",
              "CategoryID": 8,
              "CategoryName": "Seafood"
            }
          }
        ],
        "OrderTotal": 814.5,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Alfreds Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      },
      {
        "OrderID": 10692,
        "Freight": 61.02,
        "Employee": {
          "EmployeeID": 4,
          "FirstName": "Margaret",
          "LastName": "Peacock",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-10-03T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-10-31T00:00:00.000Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 43.9,
            "Quantity": 20,
            "Discount": 0,
            "Value": 878,
            "product": {
              "ProductID": 63,
              "ProductName": "Vegie-spread",
              "QuantityPerUnit": "15 - 625 g jars",
              "CategoryID": 2,
              "CategoryName": "Condiments"
            }
          }
        ],
        "OrderTotal": 878,
        "Shipment": {
          "Shipper": {
            "ShipperID": 2,
            "CompanyName": "United Package"
          },
          "ShipName": "Alfred's Futterkiste",
          "ShipAddress": "Obere Str. 57",
          "ShipCity": "Berlin",
          "ShipCountry": "Germany"
        }
      },
      ...
```

c)

```js
//Oryginalne kolekcje
db.orders.aggregate([
  {
    $match: {
      OrderDate: { $gte: new Date("1997-01-01"), $lt: new Date("1998-01-01") },
    },
  },

  {
    $lookup: {
      from: "orderdetails",
      localField: "OrderID",
      foreignField: "OrderID",
      as: "od",
    },
  },
  { $unwind: "$od" },

  {
    $lookup: {
      from: "products",
      localField: "od.ProductID",
      foreignField: "ProductID",
      as: "p",
    },
  },
  { $unwind: "$p" },

  {
    $lookup: {
      from: "categories",
      localField: "p.CategoryID",
      foreignField: "CategoryID",
      as: "c",
    },
  },
  { $unwind: "$c" },
  { $match: { "c.CategoryName": "Confections" } },

  {
    $lookup: {
      from: "customers",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "cust",
    },
  },
  { $unwind: "$cust" },

  {
    $group: {
      _id: "$CustomerID",
      CompanyName: { $first: "$cust.CompanyName" },
      ConfectionsSale97: {
        $sum: {
          $multiply: [
            "$od.UnitPrice",
            "$od.Quantity",
            { $subtract: [1, "$od.Discount"] },
          ],
        },
      },
    },
  },
  {
    $project: {
      _id: 1,
      CustomerID: "$_id",
      CompanyName: 1,
      ConfectionsSale97: 1,
    },
  },
]);

//OrdersInfo
db.orders.aggregate([
  {
    $match: {
      OrderDate: { $gte: new Date("1997-01-01"), $lt: new Date("1998-01-01") },
    },
  },

  {
    $lookup: {
      from: "orderdetails",
      localField: "OrderID",
      foreignField: "OrderID",
      as: "od",
    },
  },
  { $unwind: "$od" },

  {
    $lookup: {
      from: "products",
      localField: "od.ProductID",
      foreignField: "ProductID",
      as: "p",
    },
  },
  { $unwind: "$p" },

  {
    $lookup: {
      from: "categories",
      localField: "p.CategoryID",
      foreignField: "CategoryID",
      as: "c",
    },
  },
  { $unwind: "$c" },
  { $match: { "c.CategoryName": "Confections" } },

  {
    $lookup: {
      from: "customers",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "cust",
    },
  },
  { $unwind: "$cust" },

  {
    $group: {
      _id: "$CustomerID",
      CompanyName: { $first: "$cust.CompanyName" },
      ConfectionsSale97: {
        $sum: {
          $multiply: [
            "$od.UnitPrice",
            "$od.Quantity",
            { $subtract: [1, "$od.Discount"] },
          ],
        },
      },
    },
  },
  {
    $project: {
      _id: 1,
      CustomerID: "$_id",
      CompanyName: 1,
      ConfectionsSale97: 1,
    },
  },
]);

//CustomerInfo
db.CustomerInfo.aggregate([
  { $unwind: "$Orders" },
  {
    $match: {
      "Orders.Dates.OrderDate": {
        $gte: new Date("1997-01-01"),
        $lt: new Date("1998-01-01"),
      },
    },
  },
  { $unwind: "$Orders.Orderdetails" },
  { $match: { "Orders.Orderdetails.product.CategoryName": "Confections" } },
  {
    $group: {
      _id: "$CustomerID",
      CompanyName: { $first: "$CompanyName" },
      ConfectionsSale97: { $sum: "$Orders.Orderdetails.Value" },
    },
  },
  {
    $project: {
      _id: 1,
      CustomerID: "$_id",
      CompanyName: 1,
      ConfectionsSale97: 1,
    },
  },
]);

//Fragment Wykonania
[
  {
    "_id": "SPECD",
    "CompanyName": "Spécialités du monde",
    "ConfectionsSale97": 52.349999999999994,
    "CustomerID": "SPECD"
  },
  {
    "_id": "OLDWO",
    "CompanyName": "Old World Delicatessen",
    "ConfectionsSale97": 2758.375,
    "CustomerID": "OLDWO"
  },]
```

d)

```js
//Oryginalne kolekcje
db.customers.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "o",
    },
  },
  { $unwind: "$o" },
  {
    $lookup: {
      from: "orderdetails",
      localField: "o.OrderID",
      foreignField: "OrderID",
      as: "od",
    },
  },
  { $unwind: "$od" },
  {
    $group: {
      _id: {
        CustomerID: "$CustomerID",
        CompanyName: "$CompanyName",
        Year: { $year: "$o.OrderDate" },
        Month: { $month: "$o.OrderDate" },
      },
      Total: {
        $sum: {
          $multiply: [
            "$od.UnitPrice",
            "$od.Quantity",
            { $subtract: [1, "$od.Discount"] },
          ],
        },
      },
    },
  },
  {
    $group: {
      _id: "$_id.CustomerID",
      CompanyName: { $first: "$_id.CompanyName" },
      Sale: {
        $push: { Year: "$_id.Year", Month: "$_id.Month", Total: "$Total" },
      },
    },
  },
  { $project: { _id: 1, CustomerID: "$_id", CompanyName: 1, Sale: 1 } },
]);

//OrdersInfo
db.OrdersInfo.aggregate([
  { $unwind: "$Orderdetails" },
  {
    $group: {
      _id: {
        CustomerID: "$Customer.CustomerID",
        CompanyName: "$Customer.CompanyName",
        Year: { $year: "$Dates.OrderDate" },
        Month: { $month: "$Dates.OrderDate" },
      },
      Total: { $sum: "$Orderdetails.Value" },
    },
  },
  {
    $group: {
      _id: "$_id.CustomerID",
      CompanyName: { $first: "$_id.CompanyName" },
      Sale: {
        $push: { Year: "$_id.Year", Month: "$_id.Month", Total: "$Total" },
      },
    },
  },
  { $project: { _id: 1, CustomerID: "$_id", CompanyName: 1, Sale: 1 } },
]);

//CustomerInfo
db.CustomerInfo.aggregate([
  { $unwind: "$Orders" },
  { $unwind: "$Orders.Orderdetails" },
  {
    $group: {
      _id: {
        CustomerID: "$CustomerID",
        CompanyName: "$CompanyName",
        Year: { $year: "$Orders.Dates.OrderDate" },
        Month: { $month: "$Orders.Dates.OrderDate" },
      },
      Total: { $sum: "$Orders.Orderdetails.Value" },
    },
  },
  {
    $group: {
      _id: "$_id.CustomerID",
      CompanyName: { $first: "$_id.CompanyName" },
      Sale: {
        $push: { Year: "$_id.Year", Month: "$_id.Month", Total: "$Total" },
      },
    },
  },
  { $project: { _id: 1, CustomerID: "$_id", CompanyName: 1, Sale: 1 } },
]);

// Fragment wykonania
[
  {
    "_id": "GALED",
    "CompanyName": "Galería del gastrónomo",
    "CustomerID": "GALED",
    "Sale": [
      {
        "Year": 1996,
        "Month": 11,
        "Total": 136
      },
      {
        "Year": 1998,
        "Month": 2,
        "Total": 70
      },
      {
        "Year": 1997,
        "Month": 6,
        "Total": 155
      },
      {
        "Year": 1998,
        "Month": 3,
        "Total": 137.5
      },
      {
        "Year": 1997,
        "Month": 1,
        "Total": 338.20000000000005
      }
    ]
  },
  {
    "_id": "HILAA",
    "CompanyName": "HILARION-Abastos",
    "CustomerID": "HILAA",
    "Sale": [
      {
        "Year": 1997,
        "Month": 3,
        "Total": 4615.679999971389
      },
      {
        "Year": 1997,
        "Month": 7,
        "Total": 2638.1999999284744
      },
      {
        "Year": 1996,
        "Month": 7,
        "Total": 1119.9
      },
      {
        "Year": 1998,
        "Month": 2,
        "Total": 1375.649996906519
      },
      {
        "Year": 1996,
        "Month": 12,
        "Total": 2122.919996866584
      },
      {
        "Year": 1997,
        "Month": 10,
        "Total": 378
      },
      {
        "Year": 1997,
        "Month": 4,
        "Total": 575
      },
      {
        "Year": 1997,
        "Month": 5,
        "Total": 880.5
      },
      {
        "Year": 1998,
        "Month": 4,
        "Total": 1727.5
      },
      {
        "Year": 1998,
        "Month": 3,
        "Total": 2940.05
      },
      {
        "Year": 1997,
        "Month": 8,
        "Total": 2054
      },
      {
        "Year": 1997,
        "Month": 12,
        "Total": 2341.3639920023084
      }
    ]
  },]
  ...
```

e)

```js
//Oryginalne kolekcje
db.orders.insertOne({
  OrderID: 12000,
  CustomerID: "ALFKI",
  EmployeeID: 1,
  OrderDate: new Date(),
  ShipVia: 1,
  Freight: 1.0,
  ShipName: "Alfreds Futterkiste",
  ShipCity: "Berlin",
  ShipCountry: "Germany",
});

db.orderdetails.insertMany([
  { OrderID: 12000, ProductID: 1, UnitPrice: 18.0, Quantity: 1, Discount: 0 },
  { OrderID: 12000, ProductID: 10, UnitPrice: 31.0, Quantity: 1, Discount: 0 },
]);

// Wykonanie db.orders.find({OrderID: 12000})
[
  {
    _id: { $oid: "6a03a1d71babec3dab8c5736" },
    CustomerID: "ALFKI",
    EmployeeID: 1,
    Freight: 1,
    OrderDate: { $date: "2026-05-12T21:55:35.947Z" },
    OrderID: 12000,
    ShipCity: "Berlin",
    ShipCountry: "Germany",
    ShipName: "Alfreds Futterkiste",
    ShipVia: 1,
  },
];

//OrdersInfo
db.OrdersInfo.insertOne({
  OrderID: 12000,
  Customer: {
    CustomerID: "ALFKI",
    CompanyName: "Alfreds Futterkiste",
    City: "Berlin",
    Country: "Germany",
  },
  Dates: { OrderDate: new Date() },
  Orderdetails: [
    {
      UnitPrice: 18.0,
      Quantity: 1,
      Discount: 0,
      Value: 18.0,
      product: { ProductID: 1, ProductName: "Chai", CategoryName: "Beverages" },
    },
    {
      UnitPrice: 31.0,
      Quantity: 1,
      Discount: 0,
      Value: 31.0,
      product: { ProductID: 10, ProductName: "Ikura", CategoryName: "Seafood" },
    },
  ],
  Freight: 1.0,
  OrderTotal: 49.0,
  Shipment: { Shipper: { ShipperID: 1, CompanyName: "Speedy Express" } },
});

//Wywołanie db.OrdersInfo.find({OrderID: 12000})
[
  {
    _id: { $oid: "6a03a25d1babec3dab8c573f" },
    Customer: {
      CustomerID: "ALFKI",
      CompanyName: "Alfreds Futterkiste",
      City: "Berlin",
      Country: "Germany",
    },
    Dates: {
      OrderDate: { $date: "2026-05-12T21:57:49.997Z" },
    },
    Freight: 1,
    OrderID: 12000,
    OrderTotal: 49,
    Orderdetails: [
      {
        UnitPrice: 18,
        Quantity: 1,
        Discount: 0,
        Value: 18,
        product: {
          ProductID: 1,
          ProductName: "Chai",
          CategoryName: "Beverages",
        },
      },
      {
        UnitPrice: 31,
        Quantity: 1,
        Discount: 0,
        Value: 31,
        product: {
          ProductID: 10,
          ProductName: "Ikura",
          CategoryName: "Seafood",
        },
      },
    ],
    Shipment: {
      Shipper: {
        ShipperID: 1,
        CompanyName: "Speedy Express",
      },
    },
  },
];

//CustomerInfo
db.CustomerInfo.updateOne(
  { CustomerID: "ALFKI" },
  {
    $push: {
      Orders: {
        OrderID: 12000,
        Dates: { OrderDate: new Date() },
        Orderdetails: [
          {
            UnitPrice: 18.0,
            Quantity: 1,
            Discount: 0,
            Value: 18.0,
            product: {
              ProductID: 1,
              ProductName: "Chai",
              CategoryName: "Beverages",
            },
          },
          {
            UnitPrice: 31.0,
            Quantity: 1,
            Discount: 0,
            Value: 31.0,
            product: {
              ProductID: 10,
              ProductName: "Ikura",
              CategoryName: "Seafood",
            },
          },
        ],
        Freight: 15.0,
        OrderTotal: 49.0,
      },
    },
  },
);

//Fragment wywołania db.CustomerInfo.find({"Orders.OrderID": 12000})
[
  {
    _id: { $oid: "63a05cdfbb3b972d6f4e097b" },
    City: "Berlin",
    CompanyName: "Alfreds Futterkiste",
    Country: "Germany",
    CustomerID: "ALFKI",
    Orders: [
      {
        OrderID: 10643,
        Freight: 29.46,
        Employee: {
          EmployeeID: 6,
          FirstName: "Michael",
          LastName: "Suyama",
          Title: "Sales Representative",
        },
        Dates: {
          OrderDate: { $date: "1997-08-25T00:00:00.000Z" },
          RequiredDate: { $date: "1997-09-22T00:00:00.000Z" },
        },
        Orderdetails: [
          {
            UnitPrice: 45.6,
            Quantity: 15,
            Discount: 0.25,
            Value: 513,
            product: {
              ProductID: 28,
              ProductName: "Rössle Sauerkraut",
              QuantityPerUnit: "25 - 825 g cans",
              CategoryID: 7,
              CategoryName: "Produce",
            },
          },
          {
            UnitPrice: 18,
            Quantity: 21,
            Discount: 0.25,
            Value: 283.5,
            product: {
              ProductID: 39,
              ProductName: "Chartreuse verte",
              QuantityPerUnit: "750 cc per bottle",
              CategoryID: 1,
              CategoryName: "Beverages",
            },
          },
          {
            UnitPrice: 12,
            Quantity: 2,
            Discount: 0.25,
            Value: 18,
            product: {
              ProductID: 46,
              ProductName: "Spegesild",
              QuantityPerUnit: "4 - 450 g glasses",
              CategoryID: 8,
              CategoryName: "Seafood",
            },
          },
        ],
        OrderTotal: 814.5,
        Shipment: {
          Shipper: {
            ShipperID: 1,
            CompanyName: "Speedy Express",
          },
          ShipName: "Alfreds Futterkiste",
          ShipAddress: "Obere Str. 57",
          ShipCity: "Berlin",
          ShipCountry: "Germany",
        },
      },
      {
        OrderID: 12000,
        Dates: {
          OrderDate: { $date: "2026-05-12T22:01:42.359Z" },
        },
        Orderdetails: [
          {
            UnitPrice: 18,
            Quantity: 1,
            Discount: 0,
            Value: 18,
            product: {
              ProductID: 1,
              ProductName: "Chai",
              CategoryName: "Beverages",
            },
          },
          {
            UnitPrice: 31,
            Quantity: 1,
            Discount: 0,
            Value: 31,
            product: {
              ProductID: 10,
              ProductName: "Ikura",
              CategoryName: "Seafood",
            },
          },
        ],
        Freight: 15,
        OrderTotal: 49,
      },
    ],
  },
];
```

f)

```js
//Oryginalne kolekcje
db.orderdetails.updateMany(
  { OrderID: 12000 },
  { $inc: { Discount: 0.05 } }
);

db.OrdersInfo.updateOne(
  { OrderID: 12000 },
  [
    {
      $set: {
        Orderdetails: {
          $map: {
            input: "$Orderdetails",
            as: "od",
            in: {
              $mergeObjects: [
                "$$od",
                {
                  Discount: { $add: ["$$od.Discount", 0.05] },
                  Value: {
                    $multiply: [
                      "$$od.UnitPrice",
                      "$$od.Quantity",
                      { $subtract: [1, { $add: ["$$od.Discount", 0.05] }] }
                    ]
                  }
                }
              ]
            }
          }
        }
      }
    },
    {
      $set: {
        OrderTotal: { $sum: "$Orderdetails.Value" }
      }
    }
  ]
);

//Fragment wywołania db.orderdetails.find({OrderID: 12000})
[
  {
    "_id": {"$oid": "6a03a1d81babec3dab8c5737"},
    "Discount": 0.05,
    "OrderID": 12000,
    "ProductID": 1,
    "Quantity": 1,
    "UnitPrice": 18
  },
  {
    "_id": {"$oid": "6a03a1d81babec3dab8c5738"},
    "Discount": 0.05,
    "OrderID": 12000,
    "ProductID": 10,
    "Quantity": 1,
    "UnitPrice": 31
  },

//OrdersInfo
db.OrdersInfo.updateOne({ OrderID: 12000 }, [
  {
    $set: {
      Orderdetails: {
        $map: {
          input: "$Orderdetails",
          as: "od",
          in: {
            $mergeObjects: [
              "$$od",
              {
                Discount: { $add: ["$$od.Discount", 0.05] },
                Value: {
                  $multiply: [
                    "$$od.UnitPrice",
                    "$$od.Quantity",
                    { $subtract: [1, { $add: ["$$od.Discount", 0.05] }] },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  },
  {
    $set: {
      OrderTotal: { $sum: "$Orderdetails.Value" },
    },
  },
]);


//Fragment wykonania db.OrdersInfo.find({OrderID : 12000})
[
  {
    "_id": {"$oid": "6a03a1d71babec3dab8c5736"},
    "Customer": {
      "CustomerID": "ALFKI",
      "CompanyName": "Alfreds Futterkiste",
      "City": "Berlin",
      "Country": "Germany"
    },
    "Dates": {
      "OrderDate": {"$date": "2026-05-12T21:55:35.947Z"}
    },
    "Employee": {
      "EmployeeID": 1,
      "FirstName": "Nancy",
      "LastName": "Davolio",
      "Title": "Sales Representative"
    },
    "Freight": 1,
    "OrderID": 12000,
    "OrderTotal": 132.3,
    "Orderdetails": [
      ...
      {
        "UnitPrice": 18,
        "Quantity": 1,
        "Discount": 0.05,
        "Value": 17.099999999999998,
        "product": {
          "ProductID": 1,
          "ProductName": "Chai",
          "QuantityPerUnit": "10 boxes x 20 bags",
          "CategoryID": 1,
          "CategoryName": "Beverages"
        }
      },
      {
        "UnitPrice": 31,
        "Quantity": 1,
        "Discount": 0.05,
        "Value": 29.45,
        "product": {
          "ProductID": 10,
          "ProductName": "Ikura",
          "QuantityPerUnit": "12 - 200 ml jars",
          "CategoryID": 8,
          "CategoryName": "Seafood"
        }
      }
    ],
    "Shipment": {
      "Shipper": {
        "ShipperID": 1,
        "CompanyName": "Speedy Express"
      },
      "ShipName": "Alfreds Futterkiste",
      "ShipCity": "Berlin",
      "ShipCountry": "Germany"
    }
  }
]


//CustomerInfo
db.CustomerInfo.updateOne({ CustomerID: "ALFKI" }, [
  {
    $set: {
      Orders: {
        $map: {
          input: "$Orders",
          as: "order",
          in: {
            $cond: {
              if: { $eq: ["$$order.OrderID", 12000] },
              then: {
                $mergeObjects: [
                  "$$order",
                  {
                    Orderdetails: {
                      $map: {
                        input: "$$order.Orderdetails",
                        as: "od",
                        in: {
                          $mergeObjects: [
                            "$$od",
                            {
                              Discount: { $add: ["$$od.Discount", 0.05] },
                              Value: {
                                $multiply: [
                                  "$$od.UnitPrice",
                                  "$$od.Quantity",
                                  {
                                    $subtract: [
                                      1,
                                      { $add: ["$$od.Discount", 0.05] },
                                    ],
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    },
                  },
                ],
              },
              else: "$$order",
            },
          },
        },
      },
    },
  },
  {
    $set: {
      Orders: {
        $map: {
          input: "$Orders",
          as: "order",
          in: {
            $cond: {
              if: { $eq: ["$$order.OrderID", 12000] },
              then: {
                $mergeObjects: [
                  "$$order",
                  { OrderTotal: { $sum: "$$order.Orderdetails.Value" } },
                ],
              },
              else: "$$order",
            },
          },
        },
      },
    },
  },
]);

//Fragment po wykonaniu db.CustomerInfo.find({"Orders.OrderID" : 12000})

[
  {
    "_id": {"$oid": "63a05cdfbb3b972d6f4e097b"},
    "City": "Berlin",
    "CompanyName": "Alfreds Futterkiste",
    "Country": "Germany",
    "CustomerID": "ALFKI",
    "Orders": [
      ...
      {
        "OrderID": 12000,
        "Dates": {
          "OrderDate": {"$date": "2026-05-12T22:01:42.359Z"}
        },
        "Orderdetails": [
          {
            "UnitPrice": 18,
            "Quantity": 1,
            "Discount": 0.05,
            "Value": 17.099999999999998,
            "product": {
              "ProductID": 1,
              "ProductName": "Chai",
              "CategoryName": "Beverages"
            }
          },
          {
            "UnitPrice": 31,
            "Quantity": 1,
            "Discount": 0.05,
            "Value": 29.45,
            "product": {
              "ProductID": 10,
              "ProductName": "Ikura",
              "CategoryName": "Seafood"
            }
          }
        ],
        "Freight": 15,
        "OrderTotal": 46.55
      }
    ]
  }
]
```


# Zadanie 2 - modelowanie danych

Zaproponuj strukturę bazy danych dla wybranego/przykładowego zagadnienia/problemu

Należy wybrać jedno zagadnienie/problem (A lub B lub C)

Przykład A

- Wykładowcy, przedmioty, studenci, oceny
  - Wykładowcy prowadzą zajęcia z poszczególnych przedmiotów
  - Studenci uczęszczają na zajęcia
  - Wykładowcy wystawiają oceny studentom
  - Studenci oceniają zajęcia

Przykład B

- Firmy, wycieczki, osoby
  - Firmy organizują wycieczki
  - Osoby rezerwują miejsca/wykupują bilety
  - Osoby oceniają wycieczki

Przykład C

- Własny przykład o podobnym stopniu złożoności

a) Zaproponuj różne warianty struktury bazy danych i dokumentów w poszczególnych kolekcjach oraz przeprowadzić dyskusję każdego wariantu (wskazać wady i zalety każdego z wariantów)

- zdefiniuj schemat/reguły walidacji danych
- wykorzystaj referencje
- dokumenty zagnieżdżone
- tablice

b) Kolekcje należy wypełnić przykładowymi danymi

c) W kontekście zaprezentowania wad/zalet należy zaprezentować kilka przykładów/zapytań/operacji oraz dla których dedykowany jest dany wariant

W sprawozdaniu należy zamieścić przykładowe dokumenty w formacie JSON ( pkt a) i b)), oraz kod zapytań/operacji (pkt c)), wraz z odpowiednim komentarzem opisującym strukturę dokumentów oraz polecenia ilustrujące wykonanie przykładowych operacji na danych

Do sprawozdania należy dołączyć

- plik z kodem operacji/zapytań w wersji źródłowej (np. plik .js, np. plik .md )
- oraz kompletny zrzut wykonanych/przygotowanych baz danych (taki zrzut można wykonać np. za pomocą poleceń `mongoexport`, `mongdump` …)
  - załącznik ze zrzutem baz powinien mieć format zip


## 1. Opis problemu

Wybrany problem dotyczy systemu obsługi siłowni. W systemie występują klienci, trenerzy, zajęcia grupowe, karnety, rezerwacje miejsc oraz oceny zajęć.

Założenia:

- klient może kupować karnety,
- trener prowadzi wiele zajęć,
- klient może rezerwować miejsce na zajęciach,
- zajęcia mają limit miejsc,
- klient może oceniać zajęcia oraz trenera,
- część danych jest przechowywana jako referencje, część jako dokumenty zagnieżdżone, a część jako tablice.

Najważniejsze encje:

- `clients` - klienci siłowni,
- `trainers` - trenerzy,
- `classes` - zajęcia grupowe,
- `memberships` - karnety,
- `reservations` - rezerwacje miejsc,
- `reviews` - oceny.

## 2. Warianty struktury bazy danych

### Wariant 1: model referencyjny

W tym wariancie każda główna encja znajduje się w osobnej kolekcji. Dokumenty przechowują identyfikatory innych dokumentów, np. `clientId`, `trainerId`, `classId`.

Kolekcje:

```text
clients
trainers
classes
memberships
reservations
reviews
```

Przykładowy dokument `clients`:

```json
{
  "_id": "client_001",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "email": "jan.kowalski@example.com",
  "phone": "500600700",
  "dateOfBirth": "1998-04-12",
  "city": "Warszawa",
  "createdAt": "2026-05-01T10:00:00Z"
}
```

Przykładowy dokument `classes`:

```json
{
  "_id": "class_001",
  "name": "Trening funkcjonalny",
  "trainerId": "trainer_001",
  "room": "Sala A",
  "capacity": 15,
  "level": "beginner",
  "dayOfWeek": "Monday",
  "startTime": "18:00",
  "durationMinutes": 60,
  "active": true
}
```

Przykładowy dokument `reservations`:

```json
{
  "_id": "reservation_001",
  "clientId": "client_001",
  "classId": "class_001",
  "membershipId": "membership_001",
  "status": "confirmed",
  "reservedAt": "2026-05-12T14:30:00Z"
}
```

Zalety:

- mała duplikacja danych,
- łatwa aktualizacja danych klienta, trenera lub zajęć,
- dobra struktura dla dużej liczby rezerwacji i ocen,
- dane są dobrze znormalizowane.

Wady:

- częste zapytania wymagają łączenia danych przez `$lookup`,
- odczyt pełnych informacji o rezerwacji jest bardziej złożony,
- więcej kolekcji oznacza więcej operacji przy pobieraniu danych.

Ten wariant jest dobry, gdy system ma dużą liczbę klientów, rezerwacji i ocen, a najważniejsza jest spójność danych.

### Wariant 2: model zagnieżdżony

W tym wariancie dokument zajęć zawiera dane trenera, uczestników i oceny. Odczyt informacji o zajęciach jest bardzo szybki, bo większość danych znajduje się w jednym dokumencie.

Kolekcje:

```text
classes
clients
memberships
```

Przykładowy dokument `classes`:

```json
{
  "_id": "class_001",
  "name": "Trening funkcjonalny",
  "description": "Zajęcia wzmacniające całe ciało.",
  "trainer": {
    "trainerId": "trainer_001",
    "firstName": "Anna",
    "lastName": "Nowak",
    "specializations": ["functional_training", "mobility"]
  },
  "room": "Sala A",
  "capacity": 15,
  "schedule": {
    "dayOfWeek": "Monday",
    "startTime": "18:00",
    "durationMinutes": 60
  },
  "participants": [
    {
      "clientId": "client_001",
      "firstName": "Jan",
      "lastName": "Kowalski",
      "reservationStatus": "confirmed",
      "checkedIn": true
    }
  ],
  "reviews": [
    {
      "clientId": "client_001",
      "rating": 5,
      "comment": "Bardzo dobre tempo zajęć.",
      "createdAt": "2026-05-13T20:10:00Z"
    }
  ],
  "tags": ["strength", "mobility", "beginner"],
  "active": true
}
```

Zalety:

- szybki odczyt pełnego widoku zajęć,
- mniej zapytań do bazy,
- naturalna struktura dla danych wyświetlanych razem, np. szczegóły zajęć z uczestnikami i ocenami.

Wady:

- duplikacja danych klienta i trenera,
- trudniejsza aktualizacja, np. zmiana nazwiska klienta wymaga aktualizacji wielu dokumentów,
- dokument zajęć może stać się bardzo duży,
- gorszy wariant dla zajęć z bardzo dużą liczbą uczestników lub ocen.

Ten wariant jest dobry, gdy system często pokazuje szczegóły pojedynczych zajęć, a liczba uczestników jest ograniczona.

### Wariant 3: model mieszany

To wariant wybrany jako docelowy. Najważniejsze obiekty są w osobnych kolekcjach, ale dane naturalnie należące do jednego obiektu są zagnieżdżane.

Kolekcje:

```text
clients
trainers
classes
memberships
reservations
reviews
```

Przykładowy dokument `clients`:

```json
{
  "_id": "client_001",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "email": "jan.kowalski@example.com",
  "phone": "500600700",
  "dateOfBirth": "1998-04-12",
  "contact": {
    "city": "Warszawa",
    "street": "Sportowa 12",
    "postalCode": "00-001"
  },
  "preferences": ["strength", "functional", "evening_classes"],
  "createdAt": "2026-05-01T10:00:00Z"
}
```

Przykładowy dokument `classes`:

```json
{
  "_id": "class_001",
  "name": "Trening funkcjonalny",
  "description": "Zajęcia wzmacniające całe ciało.",
  "trainerId": "trainer_001",
  "trainerName": "Anna Nowak",
  "room": "Sala A",
  "capacity": 15,
  "level": "beginner",
  "schedule": {
    "dayOfWeek": "Monday",
    "startTime": "18:00",
    "durationMinutes": 60
  },
  "tags": ["strength", "mobility", "beginner"],
  "active": true
}
```

Przykładowy dokument `reservations`:

```json
{
  "_id": "reservation_001",
  "clientId": "client_001",
  "classId": "class_001",
  "membershipId": "membership_001",
  "status": "confirmed",
  "reservedAt": "2026-05-12T14:30:00Z",
  "attendance": {
    "checkedIn": true,
    "checkedInAt": "2026-05-13T17:55:00Z"
  }
}
```

Zalety:

- dobry kompromis między szybkością odczytu a spójnością danych,
- rezerwacje i oceny są w osobnych kolekcjach, więc mogą rosnąć bez powiększania dokumentu zajęć,
- dokumenty nadal korzystają z zalet MongoDB: zagnieżdżone obiekty i tablice,
- można łatwo pobrać listę zajęć bez każdorazowego pobierania pełnego dokumentu trenera, ponieważ w `classes` znajduje się `trainerName`.

Wady:

- występuje częściowa duplikacja danych, np. `trainerName`,
- niektóre zapytania nadal wymagają `$lookup`,
- trzeba pilnować aktualizacji pól będących snapshotami, np. nazwiska trenera.

Ten wariant jest najlepszy dla praktycznego systemu siłowni, ponieważ rezerwacje i oceny mogą mieć dużą liczbę dokumentów, ale typowe widoki aplikacji nadal są wygodne do odczytu.

## 3. Reguły walidacji danych

Poniżej znajduje się przykład walidacji dla kolekcji w wariancie mieszanym. Walidacja używa `$jsonSchema`.

Przykład dla kolekcji `clients`:

```javascript
db.createCollection("clients", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "firstName", "lastName", "email", "phone", "contact", "preferences", "createdAt"],
      properties: {
        _id: { bsonType: "string" },
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        email: { bsonType: "string", pattern: "^.+@.+\\..+$" },
        phone: { bsonType: "string" },
        dateOfBirth: { bsonType: "string" },
        contact: {
          bsonType: "object",
          required: ["city", "street", "postalCode"],
          properties: {
            city: { bsonType: "string" },
            street: { bsonType: "string" },
            postalCode: { bsonType: "string" }
          }
        },
        preferences: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        createdAt: { bsonType: "date" }
      }
    }
  }
});
```

Pełne reguły walidacji znajdują się w pliku `silownia_mongodb.js`.

## 4. Przykładowe dane

Przykładowe dane dla kolekcji `clients`:

```json
[
  {
    "_id": "client_001",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "email": "jan.kowalski@example.com",
    "phone": "500600700",
    "dateOfBirth": "1998-04-12",
    "contact": {
      "city": "Warszawa",
      "street": "Sportowa 12",
      "postalCode": "00-001"
    },
    "preferences": ["strength", "functional", "evening_classes"],
    "createdAt": "2026-05-01T10:00:00Z"
  },
  {
    "_id": "client_002",
    "firstName": "Marta",
    "lastName": "Zielinska",
    "email": "marta.zielinska@example.com",
    "phone": "501222333",
    "dateOfBirth": "1995-09-03",
    "contact": {
      "city": "Warszawa",
      "street": "Aktywna 8",
      "postalCode": "00-120"
    },
    "preferences": ["pilates", "morning_classes"],
    "createdAt": "2026-05-02T11:30:00Z"
  }
]
```

Przykładowe dane dla kolekcji `classes`:

```json
[
  {
    "_id": "class_001",
    "name": "Trening funkcjonalny",
    "description": "Zajęcia wzmacniające całe ciało.",
    "trainerId": "trainer_001",
    "trainerName": "Anna Nowak",
    "room": "Sala A",
    "capacity": 15,
    "level": "beginner",
    "schedule": {
      "dayOfWeek": "Monday",
      "startTime": "18:00",
      "durationMinutes": 60
    },
    "tags": ["strength", "mobility", "beginner"],
    "active": true
  }
]
```

Pełne dane znajdują się w pliku `silownia_mongodb.js` oraz w katalogu `export_silownia_json`.

## 5. Przykładowe zapytania i operacje

### 5.1. Wariant referencyjny: pełna lista rezerwacji z danymi klienta i zajęć

To zapytanie jest typowe dla modelu referencyjnego. Dane są rozdzielone między kolekcje, więc trzeba użyć `$lookup`.

```javascript
db.reservations.aggregate([
  {
    $lookup: {
      from: "clients",
      localField: "clientId",
      foreignField: "_id",
      as: "client"
    }
  },
  { $unwind: "$client" },
  {
    $lookup: {
      from: "classes",
      localField: "classId",
      foreignField: "_id",
      as: "class"
    }
  },
  { $unwind: "$class" },
  {
    $project: {
      _id: 0,
      reservationId: "$_id",
      status: 1,
      clientName: { $concat: ["$client.firstName", " ", "$client.lastName"] },
      className: "$class.name",
      classTime: "$class.schedule.startTime"
    }
  }
]);
```

Komentarz: zapytanie pokazuje wadę modelu referencyjnego, czyli konieczność łączenia kilku kolekcji. Jednocześnie pokazuje jego zaletę: dane klienta i zajęć nie są duplikowane.

### 5.2. Wariant zagnieżdżony: pobranie zajęć razem z uczestnikami

W modelu zagnieżdżonym uczestnicy znajdują się bezpośrednio w dokumencie zajęć.

```javascript
db.classes_embedded.find(
  { _id: "class_001" },
  {
    name: 1,
    trainer: 1,
    participants: 1,
    reviews: 1
  }
);
```

Komentarz: to zapytanie jest szybkie i proste, bo nie wymaga `$lookup`. Wadą jest to, że dane uczestników są zduplikowane wewnątrz dokumentu zajęć.

### 5.3. Wariant mieszany: sprawdzenie liczby zajętych miejsc

W modelu mieszanym rezerwacje są w osobnej kolekcji. Dzięki temu można łatwo liczyć zajęte miejsca.

```javascript
db.reservations.countDocuments({
  classId: "class_001",
  status: "confirmed"
});
```

Komentarz: taka operacja jest dobra dla wariantu mieszanego, ponieważ rezerwacje mogą rosnąć niezależnie od dokumentu zajęć.

### 5.4. Wariant mieszany: lista aktywnych zajęć z oceną średnią

```javascript
db.classes.aggregate([
  { $match: { active: true } },
  {
    $lookup: {
      from: "reviews",
      localField: "_id",
      foreignField: "classId",
      as: "reviews"
    }
  },
  {
    $addFields: {
      averageRating: { $round: [{ $avg: "$reviews.rating" }, 2] },
      reviewsCount: { $size: "$reviews" }
    }
  },
  {
    $project: {
      name: 1,
      trainerName: 1,
      room: 1,
      schedule: 1,
      averageRating: 1,
      reviewsCount: 1
    }
  }
]);
```

Komentarz: w tym zapytaniu widać kompromis modelu mieszanego. Podstawowe dane zajęć są dostępne od razu, ale średnia ocen wymaga połączenia z kolekcją `reviews`.

### 5.5. Operacja zapisu: rezerwacja miejsca

```javascript
db.reservations.insertOne({
  _id: "reservation_004",
  clientId: "client_003",
  classId: "class_001",
  membershipId: "membership_003",
  status: "confirmed",
  reservedAt: new Date("2026-05-14T09:00:00Z"),
  attendance: {
    checkedIn: false,
    checkedInAt: null
  }
});
```

Komentarz: w modelu mieszanym dodanie rezerwacji nie zmienia dokumentu zajęć. Jest to korzystne, bo wiele osób może rezerwować miejsca, a dokument `classes` nie zwiększa się przy każdej rezerwacji.

### 5.6. Operacja aktualizacji: oznaczenie obecności

```javascript
db.reservations.updateOne(
  { _id: "reservation_004" },
  {
    $set: {
      "attendance.checkedIn": true,
      "attendance.checkedInAt": new Date("2026-05-14T17:55:00Z")
    }
  }
);
```

Komentarz: pole `attendance` jest dokumentem zagnieżdżonym w rezerwacji, ponieważ obecność jest częścią informacji o konkretnej rezerwacji.

## 6. Podsumowanie

Najlepszym wariantem dla systemu siłowni jest model mieszany. Pozwala on zachować główne dane w osobnych kolekcjach, a jednocześnie korzystać z dokumentów zagnieżdżonych i tablic tam, gdzie jest to naturalne.

Model referencyjny jest najlepszy dla dużej ilości danych i wysokiej spójności. Model zagnieżdżony jest najlepszy dla szybkiego odczytu jednego kompletnego dokumentu. Model mieszany łączy oba podejścia i dlatego został wybrany jako główna propozycja.