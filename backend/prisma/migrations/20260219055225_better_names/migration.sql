/*
  Warnings:

  - You are about to drop the `levels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ordering` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `org` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `org_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subTask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SubTaskMember" DROP CONSTRAINT "SubTaskMember_subtask_id_fkey";

-- DropForeignKey
ALTER TABLE "SubTaskMember" DROP CONSTRAINT "SubTaskMember_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ordering" DROP CONSTRAINT "ordering_task_id_fkey";

-- DropForeignKey
ALTER TABLE "ordering" DROP CONSTRAINT "ordering_user_id_fkey";

-- DropForeignKey
ALTER TABLE "org_members" DROP CONSTRAINT "org_members_org_id_fkey";

-- DropForeignKey
ALTER TABLE "org_members" DROP CONSTRAINT "org_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "subTask" DROP CONSTRAINT "subTask_task_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_org_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_owner_id_fkey";

-- DropTable
DROP TABLE "levels";

-- DropTable
DROP TABLE "ordering";

-- DropTable
DROP TABLE "org";

-- DropTable
DROP TABLE "org_members";

-- DropTable
DROP TABLE "subTask";

-- DropTable
DROP TABLE "tasks";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "Users" (
    "ID" SERIAL NOT NULL,
    "username" VARCHAR(32) NOT NULL,
    "pwHashed" VARCHAR(128) NOT NULL,
    "lvl" INTEGER NOT NULL,
    "currXp" INTEGER NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Org" (
    "ID" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,

    CONSTRAINT "Org_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Org_Members" (
    "org_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Org_Members_pkey" PRIMARY KEY ("org_id","user_id")
);

-- CreateTable
CREATE TABLE "Tasks" (
    "ID" SERIAL NOT NULL,
    "owner_id" INTEGER,
    "org_id" INTEGER,
    "description" TEXT,
    "task_name" VARCHAR(32) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "urgency" INTEGER NOT NULL,

    CONSTRAINT "Tasks_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Sub_Task" (
    "ID" SERIAL NOT NULL,
    "description" TEXT,
    "task_id" INTEGER NOT NULL,

    CONSTRAINT "Sub_Task_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Ordering" (
    "user_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,
    "ind" INTEGER NOT NULL,

    CONSTRAINT "Ordering_pkey" PRIMARY KEY ("user_id","task_id")
);

-- CreateTable
CREATE TABLE "Levels" (
    "lvl" INTEGER NOT NULL,
    "lvlXP" INTEGER NOT NULL,

    CONSTRAINT "Levels_pkey" PRIMARY KEY ("lvl")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Org_name_key" ON "Org"("name");

-- AddForeignKey
ALTER TABLE "Org_Members" ADD CONSTRAINT "Org_Members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "Org"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org_Members" ADD CONSTRAINT "Org_Members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "Org"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sub_Task" ADD CONSTRAINT "Sub_Task_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Tasks"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ordering" ADD CONSTRAINT "Ordering_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ordering" ADD CONSTRAINT "Ordering_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Tasks"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTaskMember" ADD CONSTRAINT "SubTaskMember_subtask_id_fkey" FOREIGN KEY ("subtask_id") REFERENCES "Sub_Task"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTaskMember" ADD CONSTRAINT "SubTaskMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("ID") ON DELETE CASCADE ON UPDATE CASCADE;
