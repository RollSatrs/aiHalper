import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class OperatorGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Сначала проверяем JWT токен (вызываем родительский метод)
    const canActivate = await super.canActivate(context);
    
    if (!canActivate) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Проверяем, что пользователь - оператор
    if (user && user.role === 'operator') {
      return true;
    }

    throw new ForbiddenException('Доступ разрешен только операторам');
  }
}

