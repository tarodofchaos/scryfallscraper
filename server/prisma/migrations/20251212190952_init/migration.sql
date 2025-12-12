-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardPrinting" (
    "id" TEXT NOT NULL,
    "oracleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "set" TEXT NOT NULL,
    "collectorNum" TEXT NOT NULL,
    "rarity" TEXT,
    "foil" BOOLEAN,
    "imageNormal" TEXT,

    CONSTRAINT "CardPrinting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "printingId" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "acquisitionAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "printingId" TEXT NOT NULL,
    "priceEur" DECIMAL(65,30) NOT NULL,
    "qtyAvailable" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'unknown',
    "url" TEXT,
    "cards" TEXT NOT NULL,
    "totalCards" INTEGER NOT NULL DEFAULT 0,
    "validCards" INTEGER NOT NULL DEFAULT 0,
    "invalidCards" INTEGER NOT NULL DEFAULT 0,
    "owner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeckListing" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "deckName" TEXT NOT NULL,
    "deckSource" TEXT NOT NULL DEFAULT 'unknown',
    "deckUrl" TEXT,
    "deckCards" TEXT NOT NULL,
    "totalCards" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "sellerEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeckListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_printingId_fkey" FOREIGN KEY ("printingId") REFERENCES "CardPrinting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_printingId_fkey" FOREIGN KEY ("printingId") REFERENCES "CardPrinting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
