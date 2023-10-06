import { UserService } from "./user/user.service";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ChatGateway } from "./chat.gateway";
import { UserModule } from "./user/user.module";
import { MessageModule } from "./message/message.module";
import { ChatModule } from "./chat/chat.module";
import { PrismaService } from "./prisma_service/prisma.service";
import { ChatService } from "./chat/chat.service";
import { MessageService } from "./message/message.service";

@Module({
  imports: [UserModule, MessageModule, ChatModule],
  controllers: [AppController],
  providers: [
    AppService,
    ChatGateway,
    UserService,
    PrismaService,
    ChatService,
    MessageService,
  ],
})
export class AppModule {}
