-- CreateIndex
CREATE INDEX "Contact_email_phoneNumber_linkedId_idx" ON "Contact"("email", "phoneNumber", "linkedId");
