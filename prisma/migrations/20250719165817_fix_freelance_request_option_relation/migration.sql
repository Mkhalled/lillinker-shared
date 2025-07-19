-- DropForeignKey
ALTER TABLE "freelance_request_options" DROP CONSTRAINT "freelance_request_options_service_option_id_fkey";

-- AddForeignKey
ALTER TABLE "freelance_request_options" ADD CONSTRAINT "freelance_request_options_service_option_id_fkey" FOREIGN KEY ("service_option_id") REFERENCES "platform_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
