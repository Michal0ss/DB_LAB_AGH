// Zadanie 2 - modelowanie danych w MongoDB
// Temat: system silowni - klienci, trenerzy, zajecia, karnety, rezerwacje, oceny

use("gym_modeling");

db.clients.drop();
db.trainers.drop();
db.classes.drop();
db.memberships.drop();
db.reservations.drop();
db.reviews.drop();
db.classes_embedded.drop();

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

db.createCollection("trainers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "firstName", "lastName", "email", "specializations", "employmentType", "active"],
      properties: {
        _id: { bsonType: "string" },
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        email: { bsonType: "string" },
        specializations: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        employmentType: { enum: ["contract", "full_time", "part_time"] },
        active: { bsonType: "bool" }
      }
    }
  }
});

db.createCollection("classes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "name", "trainerId", "trainerName", "room", "capacity", "level", "schedule", "tags", "active"],
      properties: {
        _id: { bsonType: "string" },
        name: { bsonType: "string" },
        description: { bsonType: "string" },
        trainerId: { bsonType: "string" },
        trainerName: { bsonType: "string" },
        room: { bsonType: "string" },
        capacity: { bsonType: "number", minimum: 1 },
        level: { enum: ["beginner", "intermediate", "advanced"] },
        schedule: {
          bsonType: "object",
          required: ["dayOfWeek", "startTime", "durationMinutes"],
          properties: {
            dayOfWeek: { enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
            startTime: { bsonType: "string" },
            durationMinutes: { bsonType: "number", minimum: 15 }
          }
        },
        tags: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        active: { bsonType: "bool" }
      }
    }
  }
});

db.createCollection("memberships", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "clientId", "type", "status", "validFrom", "validTo", "price", "payment"],
      properties: {
        _id: { bsonType: "string" },
        clientId: { bsonType: "string" },
        type: { enum: ["monthly_open", "monthly_8_entries", "single_entry"] },
        status: { enum: ["active", "expired", "cancelled"] },
        validFrom: { bsonType: "date" },
        validTo: { bsonType: "date" },
        entriesLimit: { bsonType: ["number", "null"], minimum: 1 },
        price: { bsonType: "number", minimum: 0 },
        payment: {
          bsonType: "object",
          required: ["method", "paidAt", "transactionId"],
          properties: {
            method: { enum: ["card", "cash", "transfer"] },
            paidAt: { bsonType: "date" },
            transactionId: { bsonType: "string" }
          }
        }
      }
    }
  }
});

db.createCollection("reservations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "clientId", "classId", "membershipId", "status", "reservedAt", "attendance"],
      properties: {
        _id: { bsonType: "string" },
        clientId: { bsonType: "string" },
        classId: { bsonType: "string" },
        membershipId: { bsonType: "string" },
        status: { enum: ["confirmed", "cancelled", "waitlist"] },
        reservedAt: { bsonType: "date" },
        attendance: {
          bsonType: "object",
          required: ["checkedIn", "checkedInAt"],
          properties: {
            checkedIn: { bsonType: "bool" },
            checkedInAt: { bsonType: ["date", "null"] }
          }
        }
      }
    }
  }
});

db.createCollection("reviews", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "clientId", "classId", "trainerId", "rating", "createdAt"],
      properties: {
        _id: { bsonType: "string" },
        clientId: { bsonType: "string" },
        classId: { bsonType: "string" },
        trainerId: { bsonType: "string" },
        rating: { bsonType: "number", minimum: 1, maximum: 5 },
        comment: { bsonType: "string" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("classes_embedded");

db.clients.insertMany([
  {
    _id: "client_001",
    firstName: "Jan",
    lastName: "Kowalski",
    email: "jan.kowalski@example.com",
    phone: "500600700",
    dateOfBirth: "1998-04-12",
    contact: { city: "Warszawa", street: "Sportowa 12", postalCode: "00-001" },
    preferences: ["strength", "functional", "evening_classes"],
    createdAt: new Date("2026-05-01T10:00:00Z")
  },
  {
    _id: "client_002",
    firstName: "Marta",
    lastName: "Zielinska",
    email: "marta.zielinska@example.com",
    phone: "501222333",
    dateOfBirth: "1995-09-03",
    contact: { city: "Warszawa", street: "Aktywna 8", postalCode: "00-120" },
    preferences: ["pilates", "morning_classes"],
    createdAt: new Date("2026-05-02T11:30:00Z")
  },
  {
    _id: "client_003",
    firstName: "Piotr",
    lastName: "Wisniewski",
    email: "piotr.wisniewski@example.com",
    phone: "502333444",
    dateOfBirth: "1990-12-19",
    contact: { city: "Pruszkow", street: "Zdrowa 5", postalCode: "05-800" },
    preferences: ["boxing", "advanced", "evening_classes"],
    createdAt: new Date("2026-05-03T08:20:00Z")
  }
]);

db.trainers.insertMany([
  {
    _id: "trainer_001",
    firstName: "Anna",
    lastName: "Nowak",
    email: "anna.nowak@gym.pl",
    specializations: ["pilates", "mobility", "functional_training"],
    employmentType: "contract",
    active: true
  },
  {
    _id: "trainer_002",
    firstName: "Tomasz",
    lastName: "Lewandowski",
    email: "tomasz.lewandowski@gym.pl",
    specializations: ["boxing", "strength", "advanced_training"],
    employmentType: "full_time",
    active: true
  }
]);

db.classes.insertMany([
  {
    _id: "class_001",
    name: "Trening funkcjonalny",
    description: "Zajecia wzmacniajace cale cialo.",
    trainerId: "trainer_001",
    trainerName: "Anna Nowak",
    room: "Sala A",
    capacity: 15,
    level: "beginner",
    schedule: { dayOfWeek: "Monday", startTime: "18:00", durationMinutes: 60 },
    tags: ["strength", "mobility", "beginner"],
    active: true
  },
  {
    _id: "class_002",
    name: "Pilates",
    description: "Spokojne zajecia poprawiajace mobilnosc.",
    trainerId: "trainer_001",
    trainerName: "Anna Nowak",
    room: "Sala B",
    capacity: 12,
    level: "beginner",
    schedule: { dayOfWeek: "Wednesday", startTime: "09:00", durationMinutes: 45 },
    tags: ["pilates", "mobility", "morning"],
    active: true
  },
  {
    _id: "class_003",
    name: "Boks dla zaawansowanych",
    description: "Intensywny trening techniczno-kondycyjny.",
    trainerId: "trainer_002",
    trainerName: "Tomasz Lewandowski",
    room: "Sala C",
    capacity: 10,
    level: "advanced",
    schedule: { dayOfWeek: "Friday", startTime: "19:30", durationMinutes: 75 },
    tags: ["boxing", "cardio", "advanced"],
    active: true
  }
]);

db.memberships.insertMany([
  {
    _id: "membership_001",
    clientId: "client_001",
    type: "monthly_open",
    status: "active",
    validFrom: new Date("2026-05-01T00:00:00Z"),
    validTo: new Date("2026-05-31T23:59:59Z"),
    entriesLimit: null,
    price: 149.99,
    payment: { method: "card", paidAt: new Date("2026-05-01T09:15:00Z"), transactionId: "txn_001" }
  },
  {
    _id: "membership_002",
    clientId: "client_002",
    type: "monthly_8_entries",
    status: "active",
    validFrom: new Date("2026-05-01T00:00:00Z"),
    validTo: new Date("2026-05-31T23:59:59Z"),
    entriesLimit: 8,
    price: 109.99,
    payment: { method: "transfer", paidAt: new Date("2026-05-01T12:00:00Z"), transactionId: "txn_002" }
  },
  {
    _id: "membership_003",
    clientId: "client_003",
    type: "monthly_open",
    status: "active",
    validFrom: new Date("2026-05-05T00:00:00Z"),
    validTo: new Date("2026-06-04T23:59:59Z"),
    entriesLimit: null,
    price: 149.99,
    payment: { method: "cash", paidAt: new Date("2026-05-05T16:40:00Z"), transactionId: "txn_003" }
  }
]);

db.reservations.insertMany([
  {
    _id: "reservation_001",
    clientId: "client_001",
    classId: "class_001",
    membershipId: "membership_001",
    status: "confirmed",
    reservedAt: new Date("2026-05-12T14:30:00Z"),
    attendance: { checkedIn: true, checkedInAt: new Date("2026-05-13T17:55:00Z") }
  },
  {
    _id: "reservation_002",
    clientId: "client_002",
    classId: "class_002",
    membershipId: "membership_002",
    status: "confirmed",
    reservedAt: new Date("2026-05-12T18:10:00Z"),
    attendance: { checkedIn: false, checkedInAt: null }
  },
  {
    _id: "reservation_003",
    clientId: "client_003",
    classId: "class_003",
    membershipId: "membership_003",
    status: "waitlist",
    reservedAt: new Date("2026-05-13T08:00:00Z"),
    attendance: { checkedIn: false, checkedInAt: null }
  }
]);

db.reviews.insertMany([
  {
    _id: "review_001",
    clientId: "client_001",
    classId: "class_001",
    trainerId: "trainer_001",
    rating: 5,
    comment: "Bardzo dobre tempo i jasne instrukcje.",
    createdAt: new Date("2026-05-13T20:10:00Z")
  },
  {
    _id: "review_002",
    clientId: "client_002",
    classId: "class_002",
    trainerId: "trainer_001",
    rating: 4,
    comment: "Dobre zajecia, spokojna atmosfera.",
    createdAt: new Date("2026-05-13T12:20:00Z")
  }
]);

db.classes_embedded.insertOne({
  _id: "class_001",
  name: "Trening funkcjonalny",
  description: "Zajecia wzmacniajace cale cialo.",
  trainer: {
    trainerId: "trainer_001",
    firstName: "Anna",
    lastName: "Nowak",
    specializations: ["functional_training", "mobility"]
  },
  room: "Sala A",
  capacity: 15,
  schedule: { dayOfWeek: "Monday", startTime: "18:00", durationMinutes: 60 },
  participants: [
    {
      clientId: "client_001",
      firstName: "Jan",
      lastName: "Kowalski",
      reservationStatus: "confirmed",
      checkedIn: true
    }
  ],
  reviews: [
    {
      clientId: "client_001",
      rating: 5,
      comment: "Bardzo dobre tempo zajec.",
      createdAt: new Date("2026-05-13T20:10:00Z")
    }
  ],
  tags: ["strength", "mobility", "beginner"],
  active: true
});

db.clients.createIndex({ email: 1 }, { unique: true });
db.classes.createIndex({ trainerId: 1 });
db.classes.createIndex({ "schedule.dayOfWeek": 1, "schedule.startTime": 1 });
db.reservations.createIndex({ classId: 1, status: 1 });
db.reservations.createIndex({ clientId: 1 });
db.reviews.createIndex({ classId: 1 });

// Przyklady zapytan i operacji.

// 1. Wariant referencyjny: rezerwacje z danymi klientow i zajec.
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

// 2. Wariant zagniezdzony: cale zajecia razem z uczestnikami i ocenami.
db.classes_embedded.find(
  { _id: "class_001" },
  { name: 1, trainer: 1, participants: 1, reviews: 1 }
);

// 3. Wariant mieszany: liczba potwierdzonych rezerwacji na zajecia.
db.reservations.countDocuments({
  classId: "class_001",
  status: "confirmed"
});

// 4. Wariant mieszany: aktywne zajecia ze srednia ocena.
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

// 5. Operacja zapisu: dodanie rezerwacji.
db.reservations.insertOne({
  _id: "reservation_004",
  clientId: "client_003",
  classId: "class_001",
  membershipId: "membership_003",
  status: "confirmed",
  reservedAt: new Date("2026-05-14T09:00:00Z"),
  attendance: { checkedIn: false, checkedInAt: null }
});

// 6. Operacja aktualizacji: oznaczenie obecnosci.
db.reservations.updateOne(
  { _id: "reservation_004" },
  {
    $set: {
      "attendance.checkedIn": true,
      "attendance.checkedInAt": new Date("2026-05-14T17:55:00Z")
    }
  }
);
