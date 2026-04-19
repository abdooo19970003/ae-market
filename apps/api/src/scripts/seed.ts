import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as schema from "../schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const hash = (p: string) => bcrypt.hashSync(p, 10);

const log = {
  section: (t: string) => console.log(`\n\x1b[36m━━━ ${t} ━━━\x1b[0m`),
  ok: (t: string) => console.log(`  \x1b[32m✔\x1b[0m  ${t}`),
  skip: (t: string) => console.log(`  \x1b[33m–\x1b[0m  ${t} (skipped, already exists)`),
};

// ─────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────

async function seedUsers() {
  log.section("Users");

  const seedData = [
    { email: "admin@store.com", password: hash("Admin1234!"), role: "admin" as const, isActive: true },
    { email: "customer@store.com", password: hash("Pass1234!"), role: "customer" as const, isActive: true },
    { email: "jane@store.com", password: hash("Pass1234!"), role: "customer" as const, isActive: true },
    { email: "inactive@store.com", password: hash("Pass1234!"), role: "customer" as const, isActive: false },
  ];

  const insertedUsers: (typeof schema.users.$inferSelect)[] = [];

  for (const u of seedData) {
    const existing = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, u.email),
    });

    if (existing) {
      log.skip(u.email);
      insertedUsers.push(existing);
    } else {
      const [created] = await db.insert(schema.users).values(u).returning();
      log.ok(`${u.email}  [${u.role}]`);
      insertedUsers.push(created);
    }
  }

  // Seed profiles for active customers
  const profiles = [
    {
      userId: insertedUsers[1].id, firstName: "John", lastName: "Doe", phone: "+966501234567",
      city: "Riyadh", country: "SA", addressLine1: "King Fahd Rd"
    },
    {
      userId: insertedUsers[2].id, firstName: "Jane", lastName: "Smith", phone: "+905321234567",
      city: "Istanbul", country: "TR", addressLine1: "Istiklal Cd"
    },
  ];

  for (const p of profiles) {
    const exists = await db.query.userProfiles.findFirst({
      where: (up, { eq }) => eq(up.userId, p.userId),
    });
    if (!exists) {
      await db.insert(schema.userProfiles).values(p);
      log.ok(`Profile for userId=${p.userId}`);
    } else {
      log.skip(`Profile for userId=${p.userId}`);
    }
  }

  return insertedUsers;
}

async function seedCategories() {
  log.section("Categories");

  // ── Root categories ──────────────────────────
  const rootCats = [
    { name: "Electronics", slug: "electronics", sortOrder: 1 },
    { name: "Clothing", slug: "clothing", sortOrder: 2 },
    { name: "Books", slug: "books", sortOrder: 3 },
  ];

  const insertedRoots: Record<string, typeof schema.categories.$inferSelect> = {};

  for (const c of rootCats) {
    const exists = await db.query.categories.findFirst({
      where: (cats, { eq }) => eq(cats.slug, c.slug),
    });
    if (exists) {
      log.skip(c.slug);
      insertedRoots[c.slug] = exists;
    } else {
      const [created] = await db.insert(schema.categories).values(c).returning();
      log.ok(c.slug);
      insertedRoots[c.slug] = created;
    }
  }

  // ── Sub-categories ───────────────────────────
  const subCats = [
    // Electronics
    { name: "Smartphones", slug: "smartphones", parentId: insertedRoots["electronics"].id, sortOrder: 1 },
    { name: "Laptops", slug: "laptops", parentId: insertedRoots["electronics"].id, sortOrder: 2 },
    { name: "Tablets", slug: "tablets", parentId: insertedRoots["electronics"].id, sortOrder: 3 },
    // Clothing
    { name: "Men", slug: "clothing-men", parentId: insertedRoots["clothing"].id, sortOrder: 1 },
    { name: "Women", slug: "clothing-women", parentId: insertedRoots["clothing"].id, sortOrder: 2 },
  ];

  const insertedSubs: Record<string, typeof schema.categories.$inferSelect> = {};

  for (const c of subCats) {
    const exists = await db.query.categories.findFirst({
      where: (cats, { eq }) => eq(cats.slug, c.slug),
    });
    if (exists) {
      log.skip(c.slug);
      insertedSubs[c.slug] = exists;
    } else {
      const [created] = await db.insert(schema.categories).values(c).returning();
      log.ok(c.slug);
      insertedSubs[c.slug] = created;
    }
  }

  // ── Leaf sub-categories ──────────────────────
  const leafCats = [
    { name: "Pants", slug: "pants", parentId: insertedSubs["clothing-men"].id, sortOrder: 1 },
    { name: "T-Shirts", slug: "tshirts", parentId: insertedSubs["clothing-men"].id, sortOrder: 2 },
    { name: "Dresses", slug: "dresses", parentId: insertedSubs["clothing-women"].id, sortOrder: 1 },
  ];

  const insertedLeafs: Record<string, typeof schema.categories.$inferSelect> = {};

  for (const c of leafCats) {
    const exists = await db.query.categories.findFirst({
      where: (cats, { eq }) => eq(cats.slug, c.slug),
    });
    if (exists) {
      log.skip(c.slug);
      insertedLeafs[c.slug] = exists;
    } else {
      const [created] = await db.insert(schema.categories).values(c).returning();
      log.ok(c.slug);
      insertedLeafs[c.slug] = created;
    }
  }

  return { roots: insertedRoots, subs: insertedSubs, leafs: insertedLeafs };
}

async function seedAttributes(cats: Awaited<ReturnType<typeof seedCategories>>) {
  log.section("Category Attributes");

  const attrDefs = [
    // ── Smartphones attrs ───────────────────────
    { categoryId: cats.subs["smartphones"].id, name: "RAM", slug: "ram", inputType: "select" as const, unit: "GB", isRequired: true, isFilterable: true, sortOrder: 1 },
    { categoryId: cats.subs["smartphones"].id, name: "Storage", slug: "storage", inputType: "select" as const, unit: "GB", isRequired: true, isFilterable: true, sortOrder: 2 },
    { categoryId: cats.subs["smartphones"].id, name: "Processor", slug: "processor", inputType: "text" as const, unit: "", isRequired: false, isFilterable: false, sortOrder: 3 },
    { categoryId: cats.subs["smartphones"].id, name: "5G", slug: "5g", inputType: "boolean" as const, unit: "", isRequired: false, isFilterable: true, sortOrder: 4 },
    // ── Clothing (root) attrs ────────────────────
    { categoryId: cats.roots["clothing"].id, name: "Fabric", slug: "fabric", inputType: "select" as const, unit: "", isRequired: true, isFilterable: true, sortOrder: 1 },
    // ── Pants attrs (inherits Clothing) ──────────
    { categoryId: cats.leafs["pants"].id, name: "Waist", slug: "waist", inputType: "number" as const, unit: "cm", isRequired: true, isFilterable: true, sortOrder: 1 },
    { categoryId: cats.leafs["pants"].id, name: "Cut Style", slug: "cut", inputType: "select" as const, unit: "", isRequired: false, isFilterable: true, sortOrder: 2 },
    // ── Laptops attrs ────────────────────────────
    { categoryId: cats.subs["laptops"].id, name: "RAM", slug: "ram", inputType: "select" as const, unit: "GB", isRequired: true, isFilterable: true, sortOrder: 1 },
    { categoryId: cats.subs["laptops"].id, name: "Storage", slug: "storage", inputType: "select" as const, unit: "GB", isRequired: true, isFilterable: true, sortOrder: 2 },
    { categoryId: cats.subs["laptops"].id, name: "Screen", slug: "screen", inputType: "number" as const, unit: "inch", isRequired: false, isFilterable: true, sortOrder: 3 },
  ];

  const insertedAttrs: Record<string, typeof schema.categoryAttributes.$inferSelect> = {};

  for (const a of attrDefs) {
    const key = `${a.categoryId}-${a.slug}`;

    // Explicit select with composite key (categoryId + slug) to avoid false hits
    // when two different categories share the same slug (e.g. both "smartphones"
    // and "laptops" have a "ram" attribute — different rows, same slug)
    const [exists] = await db
      .select()
      .from(schema.categoryAttributes)
      .where(
        and(
          eq(schema.categoryAttributes.categoryId, a.categoryId),
          eq(schema.categoryAttributes.slug, a.slug),
        )
      )
      .limit(1);

    if (exists) {
      log.skip(`[cat:${a.categoryId}] ${a.slug}`);
      insertedAttrs[key] = exists;
    } else {
      const [created] = await db.insert(schema.categoryAttributes).values(a).returning();
      log.ok(`[cat:${a.categoryId}] ${a.name}`);
      insertedAttrs[key] = created;
    }
  }

  // ── Options for select attributes ────────────
  log.section("Attribute Options");

  const smartphonesCatId = cats.subs["smartphones"].id;
  const laptopsCatId = cats.subs["laptops"].id;
  const clothingCatId = cats.roots["clothing"].id;
  const pantsCatId = cats.leafs["pants"].id;

  const optionDefs = [
    // RAM (smartphones)
    { attrKey: `${smartphonesCatId}-ram`, options: [{ label: "4 GB", value: "4" }, { label: "6 GB", value: "6" }, { label: "8 GB", value: "8" }, { label: "12 GB", value: "12" }] },
    // Storage (smartphones)
    { attrKey: `${smartphonesCatId}-storage`, options: [{ label: "64 GB", value: "64" }, { label: "128 GB", value: "128" }, { label: "256 GB", value: "256" }, { label: "512 GB", value: "512" }] },
    // RAM (laptops)
    { attrKey: `${laptopsCatId}-ram`, options: [{ label: "8 GB", value: "8" }, { label: "16 GB", value: "16" }, { label: "32 GB", value: "32" }] },
    // Storage (laptops)
    { attrKey: `${laptopsCatId}-storage`, options: [{ label: "256 GB", value: "256" }, { label: "512 GB", value: "512" }, { label: "1 TB", value: "1000" }] },
    // Fabric (clothing)
    { attrKey: `${clothingCatId}-fabric`, options: [{ label: "Cotton", value: "cotton" }, { label: "Polyester", value: "polyester" }, { label: "Denim", value: "denim" }, { label: "Linen", value: "linen" }] },
    // Cut style (pants)
    { attrKey: `${pantsCatId}-cut`, options: [{ label: "Slim", value: "slim" }, { label: "Regular", value: "regular" }, { label: "Wide", value: "wide" }] },
  ];

  for (const def of optionDefs) {
    const attr = insertedAttrs[def.attrKey];
    if (!attr) { log.skip(`Options for ${def.attrKey} (attr not found)`); continue; }

    for (const [i, opt] of def.options.entries()) {
      const exists = await db.query.attributeOptions.findFirst({
        where: (o, { eq, and }) => and(eq(o.attributeId, attr.id), eq(o.value, opt.value)),
      });
      if (exists) {
        log.skip(`${def.attrKey} → ${opt.label}`);
      } else {
        await db.insert(schema.attributeOptions).values({ attributeId: attr.id, ...opt, sortOrder: i });
        log.ok(`${def.attrKey} → ${opt.label}`);
      }
    }
  }

  return insertedAttrs;
}

async function seedProducts(cats: Awaited<ReturnType<typeof seedCategories>>) {
  log.section("Products & Variants");

  const productDefs = [
    {
      product: { categoryId: cats.subs["smartphones"].id, name: "iPhone 15", slug: "iphone-15", sku: "APL-IP15", description: "Apple iPhone 15", isActive: true },
      variants: [
        { name: "128GB Black", sku: "APL-IP15-128-BLK", stockQuantity: 50, costPrice: "750.00", sellPrice: "999.00" },
        { name: "256GB Black", sku: "APL-IP15-256-BLK", stockQuantity: 30, costPrice: "850.00", sellPrice: "1149.00" },
        { name: "512GB White", sku: "APL-IP15-512-WHT", stockQuantity: 20, costPrice: "950.00", sellPrice: "1299.00" },
      ],
    },
    {
      product: { categoryId: cats.subs["smartphones"].id, name: "Samsung S24", slug: "samsung-s24", sku: "SAM-S24", description: "Samsung Galaxy S24", isActive: true },
      variants: [
        { name: "128GB Black", sku: "SAM-S24-128-BLK", stockQuantity: 40, costPrice: "650.00", sellPrice: "899.00" },
        { name: "256GB Silver", sku: "SAM-S24-256-SLV", stockQuantity: 25, costPrice: "750.00", sellPrice: "1049.00" },
      ],
    },
    {
      product: { categoryId: cats.subs["laptops"].id, name: "MacBook Pro 14", slug: "macbook-pro-14", sku: "APL-MBP14", description: "Apple MacBook Pro 14", isActive: true },
      variants: [
        { name: "M3 / 16GB / 512GB", sku: "APL-MBP14-M3-16-512", stockQuantity: 15, costPrice: "1600.00", sellPrice: "1999.00" },
        { name: "M3 / 32GB / 1TB", sku: "APL-MBP14-M3-32-1TB", stockQuantity: 10, costPrice: "1900.00", sellPrice: "2499.00" },
      ],
    },
    {
      product: { categoryId: cats.leafs["pants"].id, name: "Slim Chinos", slug: "slim-chinos", sku: "CLT-CHN-001", description: "Classic slim chinos", isActive: true },
      variants: [
        { name: "W30 Navy", sku: "CLT-CHN-001-30-NVY", stockQuantity: 100, costPrice: "18.00", sellPrice: "49.00" },
        { name: "W32 Navy", sku: "CLT-CHN-001-32-NVY", stockQuantity: 80, costPrice: "18.00", sellPrice: "49.00" },
        { name: "W34 Beige", sku: "CLT-CHN-001-34-BGE", stockQuantity: 60, costPrice: "18.00", sellPrice: "49.00" },
      ],
    },
    {
      product: { categoryId: cats.subs["smartphones"].id, name: "Pixel 8 Pro", slug: "pixel-8-pro", sku: "GOO-PX8P", description: "Google Pixel 8 Pro", isActive: true },
      variants: [
        { name: "128GB Obsidian", sku: "GOO-PX8P-128-OBS", stockQuantity: 0, costPrice: "700.00", sellPrice: "999.00" },
      ],
    },
  ];

  for (const def of productDefs) {
    let prod = await db.query.products.findFirst({
      where: (p, { eq }) => eq(p.slug, def.product.slug),
    });

    if (prod) {
      log.skip(`Product: ${def.product.name}`);
    } else {
      [prod] = await db.insert(schema.products).values(def.product).returning();
      log.ok(`Product: ${def.product.name}`);
    }

    for (const v of def.variants) {
      const { costPrice, sellPrice, ...variantData } = v;

      let variant = await db.query.productVariants.findFirst({
        where: (pv, { eq }) => eq(pv.sku, v.sku),
      });

      if (variant) {
        log.skip(`  Variant: ${v.sku}`);
      } else {
        [variant] = await db
          .insert(schema.productVariants)
          .values({ ...variantData, productId: prod!.id })
          .returning();

        // Set initial price
        await db.insert(schema.variantPrices).values({
          variantId: variant.id,
          costPrice,
          sellPrice,
          isActive: true,
        });

        // Log price history
        await db.insert(schema.priceHistory).values({
          variantId: variant.id,
          oldCostPrice: null,
          newCostPrice: costPrice,
          oldSellPrice: null,
          newSellPrice: sellPrice,
          reason: "manual_update",
          note: "Initial seed price",
        });

        log.ok(`  Variant: ${v.sku}  cost=${costPrice}  sell=${sellPrice}`);
      }
    }
  }
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
async function main() {
  console.log("\x1b[1m\x1b[35m🌱  Starting seed...\x1b[0m");

  try {
    await seedUsers();
    const cats = await seedCategories();
    await seedAttributes(cats);
    await seedProducts(cats);

    console.log("\n\x1b[1m\x1b[32m✅  Seed completed successfully\x1b[0m");
    console.log("\n\x1b[90mTest credentials:");
    console.log("  Admin:    admin@store.com    / Admin1234!");
    console.log("  Customer: customer@store.com / Pass1234!\x1b[0m\n");
  } catch (err) {
    console.error("\n\x1b[31m❌  Seed failed:\x1b[0m", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();