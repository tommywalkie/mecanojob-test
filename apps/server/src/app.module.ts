import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { AvailabilityModule } from "./availability/availability.module";
import { AppointmentModule } from "./appointment/appointment.module";
export const DEFAULT_DB_FILE = "my.db";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "better-sqlite3",
        database: configService.get("DB_FILE", DEFAULT_DB_FILE),
        entities: [__dirname + "/src/**/*.entity.ts"],
        synchronize: process.env.NODE_ENV !== "production",
        autoLoadEntities: true,
      }),
    }),
    UserModule,
    AvailabilityModule,
    AppointmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
