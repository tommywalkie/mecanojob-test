import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { AvailabilityModule } from './availability/availability.module'
import { AppointmentModule } from './appointment/appointment.module'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

export const DEFAULT_DB_FILE = 'my.db'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3',
        database: configService.get('DB_FILE', DEFAULT_DB_FILE),
        entities: [__dirname + '/src/**/*.entity.ts'],
        synchronize: process.env.NODE_ENV !== 'production',
        autoLoadEntities: true,
      }),
    }),
    UserModule,
    AvailabilityModule,
    AppointmentModule,
  ],
})
export class AppModule {}
