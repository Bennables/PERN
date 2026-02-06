-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "ID" SERIAL NOT NULL,
    "username" VARCHAR(32) NOT NULL,
    "pwHashed" VARCHAR(128) NOT NULL,
    "lvl" INTEGER NOT NULL,
    "currXp" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "org" (
    "ID" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,

    CONSTRAINT "org_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "org_members" (
    "org_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "org_members_pkey" PRIMARY KEY ("org_id","user_id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "ID" SERIAL NOT NULL,
    "owner_id" INTEGER,
    "org_id" INTEGER,
    "task_name" VARCHAR(32) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "urgency" INTEGER NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ordering" (
    "user_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,
    "ind" INTEGER NOT NULL,

    CONSTRAINT "ordering_pkey" PRIMARY KEY ("user_id","task_id")
);

-- CreateTable
CREATE TABLE "levels" (
    "lvl" INTEGER NOT NULL,
    "lvlXP" INTEGER NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("lvl")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "org_name_key" ON "org"("name");

-- AddForeignKey
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "org"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordering" ADD CONSTRAINT "ordering_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordering" ADD CONSTRAINT "ordering_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

