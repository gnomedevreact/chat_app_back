import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma_service/prisma.service";

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createChatRoom(to_id: string, from_id: string) {
    return await this.prisma.chat.create({
      data: {
        users: {
          connect: [{ id: to_id }, { id: from_id }],
        },
      },
      include: {
        messages: true,
      },
    });
  }

  async getChatById(id: string) {
    return await this.prisma.chat.findUnique({
      where: {
        id,
      },
      include: {
        messages: true,
      },
    });
  }
}
