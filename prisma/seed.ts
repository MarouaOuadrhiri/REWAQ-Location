import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
const db = new PrismaClient();
async function main() {
  const email = process.env.ADMIN_EMAIL,
    password = process.env.ADMIN_PASSWORD;
  if (
    !email ||
    !password ||
    password.length < 16 ||
    password.includes("REPLACE_")
  )
    throw new Error(
      "Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 16 characters in .env.",
    );
  await db.admin.upsert({
    where: { email },
    create: {
      email,
      name: "Fleet Administrator",
      passwordHash: await hash(password, 12),
    },
    update: {},
  });
  await db.pricingSettings.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });
  const fleet = [
    {
      slug: "mercedes-c-class",
      brand: "Mercedes-Benz",
      model: "C-Class",
      registration: "LOC-001",
      category: "Executive",
      fuel: "Diesel",
      dailyPrice: 500,
      weeklyPrice: 3000,
      monthlyPrice: 9000,
      image: "mercedes.png",
      description:
        "A composed executive saloon, combining a refined cabin with effortless long-distance comfort.",
    },
    {
      slug: "bmw-m2",
      brand: "BMW",
      model: "M2",
      registration: "LOC-002",
      category: "Sport",
      fuel: "Petrol",
      dailyPrice: 850,
      weeklyPrice: 5100,
      monthlyPrice: 18500,
      image: "bmw.png",
      description:
        "Poise, precision and a driver-focused interior. An expressive companion for city streets and open roads.",
    },
    {
      slug: "porsche-boxster",
      brand: "Porsche",
      model: "Boxster",
      registration: "LOC-003",
      category: "Roadster",
      fuel: "Petrol",
      dailyPrice: 1600,
      weeklyPrice: 9800,
      monthlyPrice: 35000,
      image: "porsche.png",
      description:
        "A two-seat roadster with unmistakable sporting character, a low driving position and an open-air experience.",
    },
    {
      slug: "audi-tt",
      brand: "Audi",
      model: "TT",
      registration: "LOC-004",
      category: "Sport",
      fuel: "Petrol",
      dailyPrice: 750,
      weeklyPrice: 4500,
      monthlyPrice: 16000,
      image: "audi.png",
      description:
        "Understated sophistication, beautifully resolved details and a quiet, comfortable cabin.",
    },
    {
      slug: "land-rover-discovery",
      brand: "Land Rover",
      model: "Discovery",
      registration: "LOC-005",
      category: "Luxury SUV",
      fuel: "Diesel",
      dailyPrice: 1900,
      weeklyPrice: 11500,
      monthlyPrice: 41000,
      image: "range-rover.png",
      description:
        "Confident design and a commanding driving position. Experience Morocco from a fresh perspective.",
    },
    {
      slug: "bmw-3-series",
      brand: "BMW",
      model: "3 Series",
      registration: "LOC-006",
      category: "Sport",
      fuel: "Petrol",
      dailyPrice: 650,
      weeklyPrice: 3900,
      monthlyPrice: 13500,
      image: "bmw.png",
      description:
        "Balanced proportions and engaging performance, wrapped in an elegant everyday saloon.",
    },
  ];
  for (const [i, { image, ...car }] of fleet.entries())
    await db.vehicle.upsert({
      where: { slug: car.slug },
      create: {
        ...car,
        year: 2025,
        seats: car.slug.includes("boxster")
          ? 2
          : car.slug.includes("m2") || car.slug.includes("audi-tt")
            ? 4
            : 5,
        transmission: "Automatic",
        featured: i < 3,
        images: {
          create: {
            url: "/vehicles/" + image,
            alt: car.brand + " " + car.model,
            position: 0,
          },
        },
      },
      update: {},
    });
  console.log("Seed complete: admin, pricing settings and six vehicles.");
}
main().finally(() => db.$disconnect());
