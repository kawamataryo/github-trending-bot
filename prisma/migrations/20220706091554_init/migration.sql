-- CreateTable
CREATE TABLE "repository" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "language_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,
    CONSTRAINT "repository_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "repository_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "language" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "owner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "twitter_account" TEXT
);

-- CreateTable
CREATE TABLE "trend_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repository_id" INTEGER NOT NULL,
    "star_count" INTEGER NOT NULL,
    "fork_count" INTEGER NOT NULL,
    "today_star_count" INTEGER NOT NULL,
    "created_unix_time" INTEGER NOT NULL,
    CONSTRAINT "trend_log_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "repository_url_key" ON "repository"("url");

-- CreateIndex
CREATE UNIQUE INDEX "language_name_key" ON "language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "owner_name_key" ON "owner"("name");
