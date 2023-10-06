import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as env from "dotenv";
import { AuthGuard } from "./guards/auth.guard";
import { PrismaService } from "./prisma_service/prisma.service";

env.config();

async function bootstrap() {
  const port = process.env.PORT || 5000;

  const app = await NestFactory.create(AppModule);
  app.useGlobalGuards(new AuthGuard(new PrismaService()));
  app.enableCors({
    allowedHeaders: ["content-type"],
    origin: "https://chat-app-three-swart.vercel.app/",
    credentials: true,
  });
  await app.listen(port);
}
bootstrap();
