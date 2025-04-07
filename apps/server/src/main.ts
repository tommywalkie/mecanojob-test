import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { existsSync, writeFileSync } from "fs";
import { ConfigService } from "@nestjs/config";
import { DEFAULT_DB_FILE } from "./app.module";

async function bootstrap() {
  const configService = new ConfigService();

  // Check if database file exists, create it if it doesn't
  let dbFile = configService.get("DB_FILE");
  if (!dbFile) {
    console.log(
      `process.env.DB_FILE is not set, defaulting to '${DEFAULT_DB_FILE}'`
    );
    dbFile = DEFAULT_DB_FILE;
  }
  if (!existsSync(dbFile)) {
    console.log("Database file does not exist, creating it...");
    writeFileSync(dbFile, "");
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle("MecanoJob Test")
    .setDescription("API pour le test technique de MecanoJob")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3000);
  console.log(`Application running on: ${await app.getUrl()}`);
}

bootstrap();
