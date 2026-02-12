-- CreateTable
CREATE TABLE "subTask" (
    "ID" SERIAL NOT NULL,
    "description" TEXT,
    "task_id" INTEGER NOT NULL,

    CONSTRAINT "subTask_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "SubTaskMember" (
    "subtask_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "SubTaskMember_pkey" PRIMARY KEY ("subtask_id","user_id")
);

-- AddForeignKey
ALTER TABLE "subTask" ADD CONSTRAINT "subTask_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTaskMember" ADD CONSTRAINT "SubTaskMember_subtask_id_fkey" FOREIGN KEY ("subtask_id") REFERENCES "subTask"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTaskMember" ADD CONSTRAINT "SubTaskMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("ID") ON DELETE CASCADE ON UPDATE CASCADE;
