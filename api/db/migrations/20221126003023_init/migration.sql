-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT,
    "address" TEXT,
    "locale" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mfa_enabled" BOOLEAN,
    "imageSrc" TEXT,
    "country" TEXT,
    "mintCredits" INTEGER NOT NULL DEFAULT 3,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "blocked" BOOLEAN,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "betaAccess" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "OAuth" (
    "state" TEXT NOT NULL PRIMARY KEY,
    "codeChallenge" TEXT NOT NULL,
    "codeVerifier" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "OAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
