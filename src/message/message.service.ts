import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma_service/prisma.service";
import { MessageDto } from "./dto/message.dto";

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async createMessage(dto: MessageDto) {
    await this.prisma.message.create({
      data: {
        message: dto.message,
        chat: {
          connect: { id: dto.chat_id },
        },
        from_id: dto.from_id,
        sender_id: dto.to_id,
      },
    });
  }
}
