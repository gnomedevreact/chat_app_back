import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma_service/prisma.service";
import { UserDto } from "./dto/user.dto";
import { HttpException } from "@nestjs/common";
import * as argon2 from "argon2";
import { generateToken } from "src/utils/generateToken";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return await this.prisma.user.findMany({ include: { chats: true } });
  }

  async getUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async changeUserSocketId(socket_id: string | null, user_id: string) {
    return await this.prisma.user.update({
      where: {
        id: user_id,
      },
      data: {
        socket_id,
      },
    });
  }

  async getUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        chats: {
          include: {
            messages: true,
          },
        },
      },
    });
  }

  async registerUser(dto: UserDto) {
    const isExists = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (isExists) {
      throw new HttpException(
        "This email already registered",
        HttpStatus.FORBIDDEN
      );
    }

    const password = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password,
        name: dto.name,
        surname: dto.surname,
        socket_id: null,
      },
    });

    const { token } = generateToken(user.id);

    return { user, token };
  }

  async loginUser(dto: UserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new HttpException("User doesnt exist", HttpStatus.NOT_FOUND);
    }

    const isVerified = await argon2.verify(user.password, dto.password);

    if (!isVerified) {
      throw new HttpException("Invalid credentials", HttpStatus.FORBIDDEN);
    }

    const { token } = generateToken(user.id);

    return { user, token };
  }
}
