import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      status: 'ok',
      service: 'folclib-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
