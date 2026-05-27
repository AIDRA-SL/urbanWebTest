-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HeroSlide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "mobileImageUrl" TEXT,
    "headline" TEXT,
    "subheadline" TEXT,
    "ctaText" TEXT,
    "ctaLink" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_HeroSlide" ("createdAt", "ctaLink", "ctaText", "headline", "id", "imageUrl", "isActive", "mobileImageUrl", "sortOrder", "subheadline", "updatedAt") SELECT "createdAt", "ctaLink", "ctaText", "headline", "id", "imageUrl", "isActive", "mobileImageUrl", "sortOrder", "subheadline", "updatedAt" FROM "HeroSlide";
DROP TABLE "HeroSlide";
ALTER TABLE "new_HeroSlide" RENAME TO "HeroSlide";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
