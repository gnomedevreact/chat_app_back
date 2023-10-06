import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { PrismaService } from "src/prisma_service/prisma.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers: string = request.headers.authorization;

    const excludedPaths = [
      "/user/login",
      "/user/register",
      "/user/get_all_users",
    ];

    if (excludedPaths.includes(request.path)) {
      return true;
    }

    if (headers && headers.startsWith("Bearer")) {
      const token = headers.split(" ")[1];

      const isValidToken = jwt.verify(token, process.env.JWT_SECRET);

      if (!isValidToken) {
        throw new UnauthorizedException();
      }

      const decoded = jwt.decode(token);

      const user = await this.prisma.user.findUnique({
        where: {
          //@ts-ignore
          id: decoded.user_id,
        },
      });

      if (user) {
        return true;
      } else {
        throw new UnauthorizedException();
      }
    } else {
      throw new UnauthorizedException();
    }
  }
}
