import { Body, Controller, Post } from "@nestjs/common";
import { MessageService } from "./message.service";
import { MessageDto } from "./dto/message.dto";

@Controller("message")
export class MessageController {
  constructor(private readonly MessageService: MessageService) {}

  @Post()
  createMessage(@Body() dto: MessageDto) {
    return this.MessageService.createMessage(dto);
  }
}
