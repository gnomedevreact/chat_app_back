import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as env from "dotenv";
import { AuthGuard } from "./guards/auth.guard";
import { PrismaService } from "./prisma_service/prisma.service";

env.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalGuards(new AuthGuard(new PrismaService()));
  app.enableCors();
  await app.listen(5000);
}
bootstrap();
