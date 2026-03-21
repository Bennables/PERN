-- CreateTable
CREATE TABLE "Chat" (
    "ID" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Chat_Message" (
    "ID" SERIAL NOT NULL,
    "chat_id" INTEGER NOT NULL,
    "role" VARCHAR(16) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_Message_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chat_task_id_key" ON "Chat"("task_id");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Tasks"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat_Message" ADD CONSTRAINT "Chat_Message_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("ID") ON DELETE CASCADE ON UPDATE CASCADE;
