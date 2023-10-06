import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatDto } from "./dto/chat.dto";

@Controller("chat")
export class ChatController {
  constructor(private readonly ChatService: ChatService) {}

  @Get("get_chat/:id")
  getChatById(@Param("id") id: string) {
    return this.ChatService.getChatById(id);
  }

  @Post("create")
  createChat(@Body() dto: ChatDto) {
    return this.ChatService.createChatRoom(dto.to_id, dto.from_id);
  }
}
