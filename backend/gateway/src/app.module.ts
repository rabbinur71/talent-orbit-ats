import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthProxyController } from './proxy/auth-proxy.controller';

@Module({
  imports: [HttpModule],
  controllers: [AppController, AuthProxyController],
  providers: [AppService],
})
export class AppModule {}
