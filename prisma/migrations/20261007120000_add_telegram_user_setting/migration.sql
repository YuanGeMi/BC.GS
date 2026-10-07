-- CreateTable
CREATE TABLE "TelegramUserSetting" (
    "telegramUserId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramUserSetting_pkey" PRIMARY KEY ("telegramUserId")
);
