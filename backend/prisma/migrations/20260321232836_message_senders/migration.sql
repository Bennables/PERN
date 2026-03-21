-- AlterTable
ALTER TABLE "Chat_Message" ADD COLUMN     "sender_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Chat_Message" ADD CONSTRAINT "Chat_Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;
