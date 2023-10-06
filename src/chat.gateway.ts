import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import * as jwt from "jsonwebtoken";
import { UserService } from "./user/user.service";
import { ChatService } from "./chat/chat.service";
import { MessageService } from "./message/message.service";

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private readonly UserService: UserService,
    private readonly ChatService: ChatService,
    private readonly MessageService: MessageService
  ) {}

  @WebSocketServer() server: Server;

  afterInit(server: any) {
    server.use(this.authenticateSocket);
  }

  authenticateSocket(socket, next) {
    const token = socket.handshake.query.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET,
      (err: any, decoded: { user_id: string }) => {
        if (err) return next(new Error("Authentication error"));

        socket.user = decoded;
        next();
      }
    );
  }

  private onlineUsers: {
    socketId: string;
    user_id: string;
    name: string;
    surname: string;
  }[] = [];

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    //@ts-ignore
    const user_id = client.user.user_id;
    const user_info = await this.UserService.getUserById(user_id);

    this.onlineUsers.push({
      socketId: client.id,
      user_id,
      name: user_info.name,
      surname: user_info.surname,
    });
    this.server.emit("onlineUsersList", this.onlineUsers);
    this.UserService.changeUserSocketId(client.id, user_id);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.onlineUsers = this.onlineUsers.filter(
      //@ts-ignore
      (user) => user.user_id !== client.user.user_id
    );
    this.server.emit("onlineUsersList", this.onlineUsers);
    //@ts-ignore
    this.UserService.changeUserSocketId(null, client.user.user_id);
  }

  @SubscribeMessage("privateMessage")
  async handlePrivateMessage(
    client: Socket,
    payload: {
      recipientSocketId: string;
      message: string;
      recipient_id: string;
    }
  ): Promise<void> {
    console.log(payload);
    //@ts-ignore
    const user = await this.UserService.getUserById(client.user.user_id);

    const existing_chat = user.chats.find((chat) =>
      //@ts-ignore
      chat.userIds.includes(client.user.user_id)
    );

    console.log(existing_chat);

    if (!existing_chat) {
      const chat = await this.ChatService.createChatRoom(
        payload.recipient_id,
        //@ts-ignore
        client.user.user_id
      );

      this.MessageService.createMessage({
        message: payload.message,
        chat_id: chat.id,
        //@ts-ignore
        from_id: client.user.user_id,
        to_id: payload.recipient_id,
      });
    }

    this.MessageService.createMessage({
      message: payload.message,
      chat_id: existing_chat.id,
      //@ts-ignore
      from_id: client.user.user_id,
      to_id: payload.recipient_id,
    });

    this.server.to(payload.recipientSocketId).emit("newPrivateMessage", {
      senderSocketId: client.id,
      message: payload.message,
    });
  }

  @SubscribeMessage("getOnlineUsers")
  handleGetOnlineUsers(client: Socket): void {
    client.emit("onlineUsersList", this.onlineUsers);
  }
}
